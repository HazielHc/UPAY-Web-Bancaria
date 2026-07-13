const STORAGE_KEY = "upay_contacts";

export interface Contact {
  id: string;
  name: string;
  accountId: string; 
  initials: string;
  account: string; 
}

export function getContacts(): Contact[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addContact(name: string, accountId: string, displayAccount: string): Contact[] {
  const initials = name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const newContact: Contact = {
    id: crypto.randomUUID(),
    name: name.trim(),
    accountId: accountId.trim(),
    initials,
    account: displayAccount,
  };

  const updated = [...getContacts(), newContact];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeContact(contactId: string): Contact[] {
  const updated = getContacts().filter((c) => c.id !== contactId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}