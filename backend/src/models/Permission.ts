import mongoose, { Schema, Document } from 'mongoose';
import { Permission as IPermission } from '../../../shared/types';

export interface PermissionDocument extends Omit<IPermission, '_id'>, Document { }

const permissionSchema = new Schema<PermissionDocument>({
    name: {
        type: String,
        required: [true, 'Permission name is required'],
        unique: true,
        trim: true
    },
    module: {
        type: String,
        required: [true, 'Module is required'],
        trim: true
    },
    action: {
        type: String,
        required: [true, 'Action is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret: any) {
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes
permissionSchema.index({ module: 1, action: 1 }, { unique: true });

export const Permission = mongoose.model<PermissionDocument>('Permission', permissionSchema);
