const {
    DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const AuditLog = sequelize.define('AuditLog', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        actor: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Username or identifier of who performed the action'
        },
        action: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Action performed (e.g., CREATE_QUESTION, UPDATE_DRIVER, LOGIN)'
        },
        meta: {
            type: DataTypes.JSONB,
            allowNull: true,
            comment: 'Additional metadata about the action'
        }
    }, {
        tableName: 'audit_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [{
                fields: ['actor']
            },
            {
                fields: ['action']
            },
            {
                fields: ['created_at']
            }
        ]
    });

    // Class methods
    AuditLog.logAction = async function (actor, action, meta = null) {
        return await AuditLog.create({
            actor,
            action,
            meta
        });
    };

    AuditLog.logAdminAction = async function (adminUsername, action, meta = null) {
        return await AuditLog.logAction(adminUsername, action, meta);
    };

    AuditLog.logSystemAction = async function (action, meta = null) {
        return await AuditLog.logAction('SYSTEM', action, meta);
    };

    AuditLog.getAdminActivity = async function (adminUsername, limit = 50) {
        return await AuditLog.findAll({
            where: {
                actor: adminUsername
            },
            order: [
                ['created_at', 'DESC']
            ],
            limit
        });
    };

    AuditLog.getRecentActivity = async function (limit = 100) {
        return await AuditLog.findAll({
            order: [
                ['created_at', 'DESC']
            ],
            limit
        });
    };

    AuditLog.getActionStats = async function (days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const stats = await AuditLog.findAll({
            where: {
                created_at: {
                    [sequelize.Sequelize.Op.gte]: startDate
                }
            },
            attributes: [
                'action',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['action'],
            order: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'DESC']
            ]
        });

        return stats;
    };

    return AuditLog;
};