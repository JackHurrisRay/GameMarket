/**
 * Created by Jack.L on 2017/4/29.
 */

var dbSystem = require('./mongoDB');
dbSystem.init();

module.exports =
    (
        function()
        {
            var instance =
            {
                ACCOUNTS:{},
                getDB:function()
                {
                    return dbSystem.getDB();
                },
                login:function(account)
                {
                    this.ACCOUNTS[account.ID] = account;


                }
            };

            return instance;
        }
    )();
