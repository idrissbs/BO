import { unwrapSnapshot, unwrapSnapshotInMap } from '../firebase';


const unwrapChanges = changes => {
    const data = [];
    changes.forEach(snap => {
        data.push(snap.doc.data());
    });
    return data;
};

const unwrapSnapshotInMap = snapshot => {
    const data = {};
    snapshot.forEach(doc => (data[doc.id] = doc.data()));
    return data;
};
// networking utils
const formatResponse = (response, code, error = false) => ({
    error,
    code,
    response
});

export const withResponse = apiCall => {
    return new Promise(async resolve => {
        try {
            const response = await apiCall();
            resolve(formatResponse(response));
        } catch (err) {
            resolve(formatResponse(err, 'INTERNAL_SERVER_ERROR', true));
        }
    });
};

export const accessorBuilder = (reference, docId) => ({
    get: async () => {
        const result = await withResponse(() => reference.doc(docId).get());
        const { response, error } = result;
        error && console.error('Error : ' + JSON.stringify(result));
        return response.data();
    },
    set: async (data, options = {}) => {
        const result = await withResponse(() => reference.doc(docId).set(data, options));
        result.error && console.error('Error : ' + JSON.stringify(result));
        return result;
    },
    list: async () => {
        const result = await withResponse(() => reference.get());
        const { response, error } = result;
        error && console.error('Error : ' + JSON.stringify(result));
        return unwrapSnapshot(response);
    },
    map: async () => {
        const result = await withResponse(() => reference.get());
        const { response, error } = result;
        error && console.error('Error : ' + JSON.stringify(result));
        return unwrapSnapshotInMap(response, true);
    },
    delete: async () => {
        const result = await withResponse(() => reference.doc(docId).delete());
        result.error && console.error('Error : ' + JSON.stringify(result));
        return result;
    },
    getRef: () => reference.doc(docId),
    onSnapShot: cb => reference.doc(docId).onSnapshot(cb)
});
