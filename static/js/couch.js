var Couch = (function() {


  /**
   *
   *  DB:
   *    hacker-tracker
   *      patterns
   *        pattern1
   *          grid
   *            row
   *              col
   *                sound
   *      sounds
   * 
   */


  var Couch = {
    _db_ip: '192.168.0.20',
    _db_port: '5984',
    _db_name: 'hacker-tracker',
    _doc_id: '7472b1b08cea43b15c9f350dad0021eb',


    init: function() {
      this.url = this._db_ip + ':' + this._db_port + '/' + this._db_name;
    },

    send: function(opt) {

      opt = opt || {};
      opt.method = opt.method || 'GET';
      opt.url = opt.url || this.url;
      opt.query = opt.query || '';

      var xhr = new XMLHttpRequest();
      xhr.open(opt.method, opt.url + opt.query, true);

      xhr.onreadystatechange = function() {

        switch(xhr.readyState) {
          case 1: break;
          case 2: break;
          case 3: break;
          case 4: {

            switch(xhr.status) {
              case 200:
                if(opt.success)
                  opt.success(xhr);
                break;
              default:
            }

          } break;
        }

      };

      xhr.send(opt.data);
    },

    sendSound: function(sound) {

      this.send({
        method: 'POST',
        query: ''
      });

    }
  };
  



  // Self initialize
  Couch.init();

  return Couch;
}());