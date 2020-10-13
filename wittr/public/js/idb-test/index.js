import idb from 'idb';

const dbPromise = idb.open('test-db', 4, function (upgradeDb) {
  switch (upgradeDb.oldVersion) {
    case 0:
      const keyValStore = upgradeDb.createObjectStore('keyval');
      keyValStore.put('world', 'hello');
    case 1:
      upgradeDb.createObjectStore('people', { keyPath: 'name' });
    case 2: {
      const peopleStore = upgradeDb.transaction.objectStore('people');
      peopleStore.createIndex('animal', 'favoriteAnimal');
    }
    case 3: {
      const peopleStore = upgradeDb.transaction.objectStore('people');
      peopleStore.createIndex('age', 'age');
    }
  }
});

dbPromise.then(function (db) {
  const tx = db.transaction('keyval');
  const keyValStore = tx.objectStore('keyval');
  return keyValStore.get('hello');
}).then(function (val) {
  console.log('The value of "hello" is:', val);
});

dbPromise.then(function (db) {
  const tx = db.transaction('keyval', 'readwrite');
  const keyValStore = tx.objectStore('keyval');
  keyValStore.put('bar', 'foo');
  return tx.complete;
}).then(function () {
  console.log("Added foo:bar to keyval");
});

dbPromise.then(function (db) {
  const tx = db.transaction('keyval', 'readwrite');
  const keyValStore = tx.objectStore('keyval');
  keyValStore.put('all', 'favoriteAnimal');
  return tx.complete;
}).then(function () {
  console.log("Added favoriteAnial:all to keyval");
});

dbPromise.then(function (db) {
  const tx = db.transaction('people', 'readwrite');
  const peopleStore = tx.objectStore('people');
  peopleStore.put({
    name: 'John Doe',
    age: 42,
    favoriteAnimal: 'llama'
  });
  return tx.complete;
}).then(function () {
  console.log('Person added');
});

dbPromise.then(function (db) {
  const tx = db.transaction('people');
  const peopleStore = tx.objectStore('people');
  const animalIndex = peopleStore.index('animal');
  // return peopleStore.getAll();
  // return animalIndex.getAll();
  return animalIndex.getAll('cat');
}).then(function (people) {
  console.log('People:', people);
});

dbPromise.then(function (db) {
  const tx = db.transaction('people');
  const peopleStore = tx.objectStore('people');
  const ageIndex = peopleStore.index('age');
  return ageIndex.getAll();
}).then(function (people) {
  console.log('People by age:', people);
});

dbPromise.then(function (db) {
  const tx = db.transaction('people');
  const peopleStore = tx.objectStore('people');
  const ageIndex = peopleStore.index('age');
  return ageIndex.openCursor();
}).then(function (cursor) {
  if (!cursor) return;
  cursor.advance(2);
}).then(function logPerson(cursor) {
  if (!cursor) return;
  console.log('Cursored at:', cursor.value.name);
  // cursor.update(newValue);
  // cursor.delete();
  return cursor.continue().then(logPerson);
}).then(function () {
  console.log('Done cursoring');
});