// src/utils/indexedDbHelper.ts

// IndexedDB 열기
export const openDatabase = (dbName: string, version: number) => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    // 데이터베이스 버전이 올라갈 때 실행
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBRequest).result as IDBDatabase;

      // 객체 저장소가 없다면 생성
      if (!db.objectStoreNames.contains("messages")) {
        const store = db.createObjectStore("messages", { keyPath: "id" });

        // roomId에 대한 인덱스를 생성
        store.createIndex("roomId", "roomId", { unique: false });
      }
    };

    request.onsuccess = (event) => resolve((event.target as IDBRequest).result); // 성공 시 데이터베이스 반환
    request.onerror = (event) => reject((event.target as IDBRequest).error); // 실패 시 오류 반환
  });
};

// 방별 메시지 저장
export const addMessageToRoom = async (
  db: IDBDatabase,
  roomId: string,
  message: any
) => {
  const store = getStore(db, "messages", "readwrite");
  store.add({ ...message, roomId }); // 방 ID를 포함하여 메시지 추가
};

// 방별 메시지 불러오기
export const getMessagesFromRoom = async (db: IDBDatabase, roomId: string) => {
  const store = getStore(db, "messages");
  // roomId로 인덱스된 메시지 가져오기
  const request = store.index("roomId").getAll(roomId);
  return new Promise<any[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
};

// 객체 저장소 접근
const getStore = (
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode = "readonly"
) => {
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};
