"use client";
import { useRef, useState, useEffect } from "react";
import recordAudio from "@/utils/recordAudio";
import {
  Send,
  MicRounded,
  CancelRounded,
  CheckCircleRounded,
} from "@mui/icons-material";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "@/utils/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { nanoid } from "nanoid";

const ChatFooter = ({
  input,
  image,
  user,
  chat,
  chatId,
  handleChange,
  sendMessage,
  setAudioId,
}) => {
  const canRecord = !!navigator.mediaDevices.getUserMedia && !!window.MediaRecorder;
  const canSendMessage = input.trim() || (input === "" && image);

  const record = useRef(null);
  const timerInterval = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState("00.00");

  useEffect(() => {
    if (isRecording) {
      record.current.start();
      startTimer();
    }

    function pad(value) {
      return String(value).length < 2 ? `0${value}` : value;
    }

    function startTimer() {
      const start = Date.now();
      timerInterval.current = setInterval(setTime, 100);

      function setTime() {
        const timeElapsed = Date.now() - start;
        const totalSeconds = Math.floor(timeElapsed / 1000);
        const minutes = pad(parseInt(totalSeconds / 60));
        const seconds = pad(parseInt(totalSeconds % 60));
        const duration = `${minutes}:${seconds}`;
        setDuration(duration);
      }
    }
  }, [isRecording]);

  const recordIcons = (
    <>
      <Send style={{ width: 20, height: 20, color: "white" }} />
      <MicRounded style={{ width: 24, height: 24, color: "white" }} />
    </>
  );

  async function startRecording(e) {
    e.preventDefault();
    record.current = await recordAudio();
    setIsRecording(true);
    setAudioId("");
  }

  async function stopRecording() {
    clearInterval(timerInterval.current);
    setIsRecording(false);
    const audio = await record.current.stop();
    setDuration("00:00");
    return audio;
  }

  async function submitRecording() {
    const audio = await stopRecording();
    const { audioFile, audioName } = await audio;
    sendAudio(audioFile, audioName);
  }

  async function sendAudio(audioFile, audioName) {
    await setDoc(doc(db, `users/${user.uid}/chats/${chatId}`), {
      name: chat.name,
      photoURL: chat.photoURL || null,
      timestamp: serverTimestamp(),
    });

    const newDoc = await addDoc(collection(db, `groups/${chatId}/messages`), {
      name: user.displayName,
      uid: user.uid,
      timestamp: serverTimestamp(),
      time: new Date().toUTCString(),
      audioUrl: "uploading",
      audioName,
    });

    await uploadBytes(ref(storage, `audio/${audioName}`), audioFile);
    const url = await getDownloadURL(ref(storage, `audio/${audioName}`));
    await updateDoc(
      doc(db, `groups/${chatId}/messages/${newDoc.id}`), {
        audioUrl: url,
      }
    );
  }

  function audioInputChange(e) {
    const audioFile = e.target.files[0];
    const audioName = nanoid();

    if (audioFile) {
      setAudioId("");
      sendAudio(audioFile, audioName);
    }
  }

  return (
    <div className="chat__footer">
      <form action="">
        <input
          type="text"
          placeholder="Type a message"
          value={input}
          onChange={handleChange}
          style={{
            width: isRecording ? "calc(100% - 20px)" : "calc(100% - 112px)",
          }}
        />

        {canRecord ? (
          <button
            onClick={canSendMessage ? sendMessage : startRecording}
            type="submit"
            className="send__btn"
          >
            {recordIcons}
          </button>
        ) : (
          <>
            <label htmlFor="capture" className="send_btn">
              {recordIcons}
            </label>
            <input
              type="file"
              style={{ display: "none" }}
              id="capture"
              accept="audio/*"
              capture
              onChange={audioInputChange}
            />
          </>
        )}
      </form>

      {isRecording && (
        <div className="record">
          <CancelRounded
            onClick={stopRecording}
            style={{ width: 30, height: 30, color: "#f20519" }}
          />
          <div>
            <div className="record__redcircle"></div>
            <div className="record__duration">{duration}</div>
          </div>
          <CheckCircleRounded
            onClick={submitRecording}
            style={{ width: 30, height: 30, color: "#41bf49" }}
          />
        </div>
      )}
    </div>
  );
};
export default ChatFooter;
