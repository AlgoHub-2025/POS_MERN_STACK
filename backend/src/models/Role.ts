import mongoose, { Schema, Document } from 'mongoose';
export interface RoleDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    permissions?: mongoose.Types.ObjectId[];
}

const roleSchema = new Schema<RoleDocument>({
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: [true, 'Tenant ID is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Role name is required'],
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
roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const Role = mongoose.model<RoleDocument>('Role', roleSchema);
