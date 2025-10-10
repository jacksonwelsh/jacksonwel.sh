import { QUICKPICK_SQLITE_PATH } from '$env/static/private';
import Database from 'better-sqlite3';

const db = new Database(QUICKPICK_SQLITE_PATH);

export default db;
