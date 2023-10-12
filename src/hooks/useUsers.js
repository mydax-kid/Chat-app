import { db } from "@/utils/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

function useUsers(user) {
    //get users in 'users' collection
    const [snapshot] = useCollection(
        query(collection(db, 'users'), orderBy('timestamp', 'desc'))
    )

    const users = []

    snapshot?.docs.forEach(doc =>  {
        //create unique id:append user-id to chat-id
        const id = doc.id > user.uid ? `${doc.id}${user.uid}` : `${user.uid}${doc.id}`

        //exclude currently 'logged in user' from users list
        if (doc.id !== user.uid) {
            users.push({id, ...doc.data()})
        }
    })

    return users;
}

export default useUsers;