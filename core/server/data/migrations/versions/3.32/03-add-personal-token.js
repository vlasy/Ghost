const commands = require('../../../schema').commands;

module.exports = {
    config: {
        transaction: true
    },

    up: commands.createColumnMigration({
        table: 'users',
        column: 'personal_api_token',
        columnDefinition: {
            type: 'string',
            maxlength: 1024,
            nullable: true
        },
        dbIsInCorrectState(hasColumn) {
            return hasColumn === true;
        },
        operation: commands.addColumn,
        operationVerb: 'Adding'
    }),

    down: commands.createColumnMigration({
        table: 'users',
        column: 'personal_api_token',
        dbIsInCorrectState(hasColumn) {
            return hasColumn === false;
        },
        operation: commands.dropColumn,
        operationVerb: 'Dropping'
    })
};
