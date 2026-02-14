'use client';

import { BackButton } from "../components/BackButton"
import { LogOutButton } from "../components/LogOutButton"
import { ImportButton } from "../components/ImportButton";
import styles from './settings.module.css'

export default function SettingsClient() {
    return (
        <main>
            <header className={styles.header}>
                <div className={styles.headerButtons}>
                    <BackButton/>
                </div>
                <div className={styles.headerInner}>
                    <h1 className={styles.title}> Settings </h1>
                </div>
            </header>

            <div className={styles.headerDivider}></div>

            <div className = {styles.body}>
                <div className={styles.notifications}>
                    <h1 className={styles.bodyTitle}> Notifications </h1>
                    <fieldset className={styles.bodyContent}>
                        <legend>Opt in for notifications</legend>
                        <div>
                            <input type="checkbox" id="sms"/>
                            <label htmlFor="sms">SMS</label>
                        </div>
                        <div>
                            <input type="checkbox" id="push"/>
                            <label htmlFor="push">Push Notifications</label>
                        </div>
                        <div>
                            <input type="checkbox" id="email"/>
                            <label htmlFor="email">Email</label>
                        </div>
                    </fieldset>
                </div>

                <div className={styles.importData}>
                    <h1 className={styles.bodyTitle}> Import SAP Data </h1>
                    <div className={styles.bodyContent}>
                        <ImportButton />
                    </div>
                </div>

                <div className={styles.logOut}>
                    <LogOutButton/>
                </div>
            </div>
        </main>
    );
}