// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('algohub_pos');

// Create application user
db.createUser({
  user: 'algohub_user',
  pwd: 'algohub_password',
  roles: [
    {
      role: 'readWrite',
      db: 'algohub_pos'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('tenants', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'slug', 'plan', 'isActive'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        slug: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        plan: {
          enum: ['basic', 'pro', 'enterprise'],
          description: 'must be one of: basic, pro, enterprise'
        },
        isActive: {
          bsonType: 'bool',
          description: 'must be a boolean'
        }
      }
    }
  }
});

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tenantId', 'email', 'password', 'firstName', 'lastName'],
      properties: {
        tenantId: {
          bsonType: 'objectId',
          description: 'must be an objectId and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'must be a string with at least 6 characters'
        },
        firstName: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        lastName: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        isActive: {
          bsonType: 'bool',
          description: 'must be a boolean'
        }
      }
    }
  }
});

db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tenantId', 'name', 'sku', 'unit', 'cost', 'price'],
      properties: {
        tenantId: {
          bsonType: 'objectId',
          description: 'must be an objectId and is required'
        },
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        sku: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        unit: {
          enum: ['pcs', 'kg', 'liter', 'meter', 'box', 'dozen'],
          description: 'must be one of: pcs, kg, liter, meter, box, dozen'
        },
        cost: {
          bsonType: 'number',
          minimum: 0,
          description: 'must be a non-negative number'
        },
        price: {
          bsonType: 'number',
          minimum: 0,
          description: 'must be a non-negative number'
        },
        isActive: {
          bsonType: 'bool',
          description: 'must be a boolean'
        }
      }
    }
  }
});

db.createCollection('sales');
db.createCollection('saleitems');
db.createCollection('payments');
db.createCollection('categories');
db.createCollection('warehouses');
db.createCollection('inventory');
db.createCollection('stockmovements');
db.createCollection('purchases');
db.createCollection('purchaseitems');
db.createCollection('accounts');
db.createCollection('journalentries');
db.createCollection('journalentrylines');
db.createCollection('roles');
db.createCollection('permissions');
db.createCollection('userroles');
db.createCollection('rolepermissions');
db.createCollection('settings');
db.createCollection('notifications');
db.createCollection('auditlogs');

// Create indexes for better performance
db.tenants.createIndex({ slug: 1 }, { unique: true });
db.tenants.createIndex({ isActive: 1 });

db.users.createIndex({ tenantId: 1, email: 1 }, { unique: true });
db.users.createIndex({ tenantId: 1, isActive: 1 });

db.products.createIndex({ tenantId: 1, sku: 1 }, { unique: true });
db.products.createIndex({ tenantId: 1, barcode: 1 }, { sparse: true });
db.products.createIndex({ tenantId: 1, name: 1 });
db.products.createIndex({ tenantId: 1, isActive: 1 });
db.products.createIndex({ tenantId: 1, categoryId: 1 });

db.sales.createIndex({ tenantId: 1, saleNumber: 1 });
db.sales.createIndex({ tenantId: 1, createdAt: -1 });
db.sales.createIndex({ tenantId: 1, status: 1 });
db.sales.createIndex({ userId: 1, createdAt: -1 });

// Insert initial data
db.roles.insertMany([
  {
    name: 'Super Admin',
    description: 'Full system access',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Admin',
    description: 'Tenant administrator',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Manager',
    description: 'Store manager',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Cashier',
    description: 'Point of sale operator',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Viewer',
    description: 'Read-only access',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.permissions.insertMany([
  // User management
  { name: 'users.create', module: 'users', action: 'create', description: 'Create users', createdAt: new Date(), updatedAt: new Date() },
  { name: 'users.read', module: 'users', action: 'read', description: 'View users', createdAt: new Date(), updatedAt: new Date() },
  { name: 'users.update', module: 'users', action: 'update', description: 'Update users', createdAt: new Date(), updatedAt: new Date() },
  { name: 'users.delete', module: 'users', action: 'delete', description: 'Delete users', createdAt: new Date(), updatedAt: new Date() },
  
  // Product management
  { name: 'products.create', module: 'products', action: 'create', description: 'Create products', createdAt: new Date(), updatedAt: new Date() },
  { name: 'products.read', module: 'products', action: 'read', description: 'View products', createdAt: new Date(), updatedAt: new Date() },
  { name: 'products.update', module: 'products', action: 'update', description: 'Update products', createdAt: new Date(), updatedAt: new Date() },
  { name: 'products.delete', module: 'products', action: 'delete', description: 'Delete products', createdAt: new Date(), updatedAt: new Date() },
  
  // Sales management
  { name: 'sales.create', module: 'sales', action: 'create', description: 'Create sales', createdAt: new Date(), updatedAt: new Date() },
  { name: 'sales.read', module: 'sales', action: 'read', description: 'View sales', createdAt: new Date(), updatedAt: new Date() },
  { name: 'sales.update', module: 'sales', action: 'update', description: 'Update sales', createdAt: new Date(), updatedAt: new Date() },
  { name: 'sales.delete', module: 'sales', action: 'delete', description: 'Delete sales', createdAt: new Date(), updatedAt: new Date() },
  
  // Inventory management
  { name: 'inventory.create', module: 'inventory', action: 'create', description: 'Create inventory records', createdAt: new Date(), updatedAt: new Date() },
  { name: 'inventory.read', module: 'inventory', action: 'read', description: 'View inventory', createdAt: new Date(), updatedAt: new Date() },
  { name: 'inventory.update', module: 'inventory', action: 'update', description: 'Update inventory', createdAt: new Date(), updatedAt: new Date() },
  { name: 'inventory.delete', module: 'inventory', action: 'delete', description: 'Delete inventory records', createdAt: new Date(), updatedAt: new Date() },
  
  // Reports
  { name: 'reports.read', module: 'reports', action: 'read', description: 'View reports', createdAt: new Date(), updatedAt: new Date() },
  { name: 'reports.export', module: 'reports', action: 'export', description: 'Export reports', createdAt: new Date(), updatedAt: new Date() },
  
  // Settings
  { name: 'settings.read', module: 'settings', action: 'read', description: 'View settings', createdAt: new Date(), updatedAt: new Date() },
  { name: 'settings.update', module: 'settings', action: 'update', description: 'Update settings', createdAt: new Date(), updatedAt: new Date() }
]);

print('Database initialization completed successfully!');
print('Created collections, indexes, and initial data.');
