import { db } from "@/utils/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore"

function useChats(user) {
    //fetch chats from the 'chats' subcollection & order them by time created
    const [snapshot, loading, error] = useCollection(
        query(collection(db, `users/${user.uid}/chats`), orderBy('timestamp', 'desc'))
    )

    const chats = snapshot?.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    return chats; 
}

export default useChats;