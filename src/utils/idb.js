export const idb = (dbName = 'default') => {
    let db;

    // Инициализация базы данных
    const init = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);

            // Создаем хранилище объектов (object store), если его еще нет
            request.onupgradeneeded = (event) => {
                db = event.target.result;
                if (!db.objectStoreNames.contains('store')) {
                    db.createObjectStore('store', { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve();
            };

            request.onerror = (event) => {
                console.error("Ошибка инициализации базы данных:", event.target.error);
                reject(event.target.error);
            };
        });
    };

    // Функция для добавления данных
    const set = async (key, value) => {
        await init(); // Убедиться, что база данных инициализирована
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('store', 'readwrite');
            const store = transaction.objectStore('store');
            const request = store.put({ key, value });

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    };

    // Функция для получения данных
    const get = async (key) => {
        await init(); // Убедиться, что база данных инициализирована
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('store', 'readonly');
            const store = transaction.objectStore('store');
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result ? request.result.value : null);
            request.onerror = (event) => reject(event.target.error);
        });
    };

    // Возвращаем объект с методами
    return { set, get };
};
