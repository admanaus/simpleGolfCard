(function () {

    window.db = {
        save: save,
        get: get,
        remove: remove,
        update: update
    };

    function save(key, value) {

        localStorage.setItem(key, JSON.stringify(value));
    }

    function get(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    function remove(key) {
        localStorage.removeItem(key);
    }

    function update(key, value) {
        if (localStorage.getItem(key)) {
            save(key, value);
            return true;

        }
        return false;
    }

})();
