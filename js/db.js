var fiapDB = (function() {
  var fDB = {};
  var datastore = null;
  var that = this;

  fDB.open = function() {
    var version = 1;
    var request = indexedDB.open('fiapMob', version);

    request.onupgradeneeded = function(e) {
      var db = e.target.result;

      e.target.transaction.onerror = fDB.onerror;

      if (db.objectStoreNames.contains('interessados')) {
        db.deleteObjectStore('interessados');
      }

      var store = db.createObjectStore('interessados', {
        keyPath: 'timestamp'
      });
    };

    request.onsuccess = function(e) {
      that.datastore = e.target.result;
    };

    request.onerror = fDB.onerror;
  };

  fDB.createInteressado = function(nome, email, curso, callback) {
    var db = that.datastore;
    var transaction = db.transaction(['interessados'], 'readwrite');
    var objStore = transaction.objectStore('interessados');
    var timestamp = new Date().getTime();

    var interessado = {
      'nome': nome,
      'email': email,
      'curso': curso,
      'timestamp': timestamp
    };

    var request = objStore.put(interessado);

    request.onsuccess = function(e) {
      callback(interessado);
    };

    request.onerror = fDB.onerror;
  };

  fDB.fetchInteressados = function(callback) {
    var db = that.datastore;
    var transaction = db.transaction(['interessados'], 'readwrite');
    var objStore = transaction.objectStore('interessados');
    var cursorRequest = objStore.openCursor();

    var interessados = [];

    transaction.oncomplete = function(e) {
      callback(interessados);
    };

    cursorRequest.onsuccess = function(e) {
      var result = e.target.result;

      if (!!result == false) {
        return;
      }

      interessados.push(result.value);

      result.continue();
    };

    cursorRequest.onerror = fDB.onerror;
  };

  return fDB;
}());
