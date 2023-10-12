import { db } from "@/utils/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore"

function useGroups() {
    //fetch groups from the 'groups' collection & order them by time created
    const [snapshot, loading, error] = useCollection(
        query(collection(db, "groups"), orderBy('timestamp', 'desc'))
    )

    const groups = snapshot?.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    return groups; 
}

export default useGroups;