const {
    DataTypes
} = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('Admin', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 100],
                notEmpty: true
            }
        },
        password_hash: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING(50),
            defaultValue: 'editor',
            validate: {
                isIn: [
                    ['admin', 'editor', 'viewer']
                ]
            }
        }
    }, {
        tableName: 'admins',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [{
                unique: true,
                fields: ['username']
            },
            {
                fields: ['role']
            }
        ]
    });

    // Instance methods
    Admin.prototype.validatePassword = async function (password) {
        return await bcrypt.compare(password, this.password_hash);
    };

    Admin.prototype.toJSON = function () {
        const values = Object.assign({}, this.get());
        delete values.password_hash;
        return values;
    };

    // Class methods
    Admin.authenticate = async function (username, password) {
        const admin = await Admin.findOne({
            where: {
                username
            }
        });

        if (!admin) {
            return null;
        }

        const isValid = await admin.validatePassword(password);
        return isValid ? admin : null;
    };

    Admin.createAdmin = async function (username, password, role = 'editor') {
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        return await Admin.create({
            username,
            password_hash,
            role
        });
    };

    Admin.updatePassword = async function (adminId, newPassword) {
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(newPassword, saltRounds);

        return await Admin.update({
            password_hash
        }, {
            where: {
                id: adminId
            }
        });
    };

    // Hooks
    Admin.beforeCreate(async (admin) => {
        if (admin.changed('password_hash') && !admin.password_hash.startsWith('$2')) {
            const saltRounds = 12;
            admin.password_hash = await bcrypt.hash(admin.password_hash, saltRounds);
        }
    });

    Admin.beforeUpdate(async (admin) => {
        if (admin.changed('password_hash') && !admin.password_hash.startsWith('$2')) {
            const saltRounds = 12;
            admin.password_hash = await bcrypt.hash(admin.password_hash, saltRounds);
        }
    });

    return Admin;
};