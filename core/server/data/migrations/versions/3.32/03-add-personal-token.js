const commands = require('../../../schema').commands;

module.exports = {
    config: {
        transaction: true
    },

    up: commands.createColumnMigration({
        table: 'api_keys',
        column: 'user_id',
        columnDefinition: {
            type: 'string',
            maxlength: 24,
            nullable: true
        },
        dbIsInCorrectState(hasColumn) {
            return hasColumn === true;
        },
        operation: commands.addColumn,
        operationVerb: 'Adding'
    }),

    down: commands.createColumnMigration({
        table: 'api_keys',
        column: 'user_id',
        dbIsInCorrectState(hasColumn) {
            return hasColumn === false;
        },
        operation: commands.dropColumn,
        operationVerb: 'Dropping'
    })
};
