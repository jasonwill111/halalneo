export type AccountType = 'buyer' | 'seller';

export interface DemoAccount {
	email: string;
	fullName: string;
	company?: string;
	password: string;
	type: AccountType;
}

const ACCOUNTS_KEY = 'halalneo:demo:accounts';
const SESSION_KEY = 'halalneo:demo:session';

function readAccounts(): Record<string, DemoAccount> {
	if (typeof localStorage === 'undefined') return {};
	try {
		return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '{}') as Record<string, DemoAccount>;
	} catch {
		return {};
	}
}

function writeAccounts(accounts: Record<string, DemoAccount>) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
	} catch {
		// ignore
	}
}

function readSession(): DemoAccount | null {
	if (typeof localStorage === 'undefined') return null;
	const email = localStorage.getItem(SESSION_KEY);
	if (!email) return null;
	return readAccounts()[email] ?? null;
}

function writeSession(account: DemoAccount | null) {
	if (typeof localStorage === 'undefined') return;
	if (account) {
		localStorage.setItem(SESSION_KEY, account.email);
	} else {
		localStorage.removeItem(SESSION_KEY);
	}
}

let current = $state<DemoAccount | null>(typeof document !== 'undefined' ? readSession() : null);

export function getCurrentAccount(): DemoAccount | null {
	return current;
}

export function listAccounts(): DemoAccount[] {
	const accounts = readAccounts();
	return Object.values(accounts);
}

export function registerAccount(account: DemoAccount) {
	const accounts = readAccounts();
	accounts[account.email] = account;
	writeAccounts(accounts);
	current = account;
	writeSession(account);
}

export function findAccount(email: string): DemoAccount | undefined {
	return readAccounts()[email];
}

export function updateAccount(email: string, patch: Partial<DemoAccount>): boolean {
	const accounts = readAccounts();
	if (!accounts[email]) return false;
	accounts[email] = { ...accounts[email], ...patch };
	writeAccounts(accounts);
	if (current && current.email === email) {
		current = accounts[email];
		writeSession(current);
	}
	return true;
}

export function deleteAccount(email: string): boolean {
	const accounts = readAccounts();
	if (!accounts[email]) return false;
	delete accounts[email];
	writeAccounts(accounts);
	if (current && current.email === email) {
		current = null;
		writeSession(null);
	}
	return true;
}

export function createAccount(account: DemoAccount): boolean {
	const accounts = readAccounts();
	if (accounts[account.email]) return false;
	accounts[account.email] = account;
	writeAccounts(accounts);
	return true;
}

export function signIn(email: string, password: string): boolean {
	const account = findAccount(email);
	if (!account || account.password !== password) return false;
	current = account;
	writeSession(account);
	return true;
}

export function signOut() {
	current = null;
	if (typeof localStorage !== 'undefined') localStorage.removeItem(SESSION_KEY);
}