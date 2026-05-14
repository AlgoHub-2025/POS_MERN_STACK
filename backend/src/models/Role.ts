import mongoose, { Schema, Document } from 'mongoose';
import { Role as IRole } from '../../../shared/types';

export interface RoleDocument extends Omit<IRole, '_id'>, Document { }

const roleSchema = new Schema<RoleDocument>({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    permissions: [{
        type: Schema.Types.ObjectId,
        ref: 'Permission'
    }]
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
roleSchema.index({ name: 1 });

export const Role = mongoose.model<RoleDocument>('Role', roleSchema);
