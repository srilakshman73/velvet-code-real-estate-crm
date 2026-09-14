import {
  INITIAL_ORGANIZATIONS,
  INITIAL_USERS,
  INITIAL_PROPERTIES,
  INITIAL_LEADS,
  INITIAL_DEALS,
} from './mock-data';
import { Property, Lead, Deal, Organization, User } from '@/types';

// Global server-side state cache across requests in Next.js runtime
declare global {
  var __velvetServerDB: {
    organizations: Organization[];
    users: User[];
    properties: Property[];
    leads: Lead[];
    deals: Deal[];
  } | undefined;
}

function initDB() {
  if (!global.__velvetServerDB) {
    global.__velvetServerDB = {
      organizations: JSON.parse(JSON.stringify(INITIAL_ORGANIZATIONS)),
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      properties: JSON.parse(JSON.stringify(INITIAL_PROPERTIES)),
      leads: JSON.parse(JSON.stringify(INITIAL_LEADS)),
      deals: JSON.parse(JSON.stringify(INITIAL_DEALS)),
    };
  }
  return global.__velvetServerDB;
}

export const serverDB = {
  getOrganizations: () => initDB().organizations,
  getUsers: () => initDB().users,
  getProperties: () => initDB().properties,
  getLeads: () => initDB().leads,
  getDeals: () => initDB().deals,

  // Organization operations
  deleteOrganization: (id: string) => {
    const db = initDB();
    const index = db.organizations.findIndex((o) => o.id === id);
    if (index === -1) return false;
    db.organizations.splice(index, 1);
    // Cascade delete tenant records
    db.users = db.users.filter((u) => u.organizationId !== id);
    db.properties = db.properties.filter((p) => p.organizationId !== id);
    db.leads = db.leads.filter((l) => l.organizationId !== id);
    db.deals = db.deals.filter((d) => d.organizationId !== id);
    return true;
  },

  // User operations
  deleteUser: (id: string) => {
    const db = initDB();
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    db.users.splice(index, 1);
    return true;
  },

  // Property operations
  addProperty: (property: Property) => {
    const db = initDB();
    db.properties.unshift(property);
    return property;
  },
  deleteProperty: (id: string) => {
    const db = initDB();
    const index = db.properties.findIndex((p) => p.id === id);
    if (index === -1) return false;
    db.properties.splice(index, 1);
    return true;
  },

  // Lead operations
  addLead: (lead: Lead) => {
    const db = initDB();
    db.leads.unshift(lead);
    return lead;
  },
  deleteLead: (id: string) => {
    const db = initDB();
    const index = db.leads.findIndex((l) => l.id === id);
    if (index === -1) return false;
    db.leads.splice(index, 1);
    return true;
  },
};
