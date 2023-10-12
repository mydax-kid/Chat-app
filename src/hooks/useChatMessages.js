import { db } from "@/utils/firebase";
import { query, collection, orderBy } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

function useChatMessages(chatId) {
    const [snapshot] = useCollection(
        chatId ? query(collection(db, `groups/${chatId}/messages`), orderBy('timestamp', 'asc')) : null
    )

    const messages = snapshot?.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    return messages;
}

export default useChatMessages;