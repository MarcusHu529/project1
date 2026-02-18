'use client';

import { BackButton } from "../components/BackButton"
import { LogOutButton } from "../components/LogOutButton"
import { ImportButton } from "../components/ImportButton";
import styles from './settings.module.css'
import { approveUser, rejectUser } from "./actions";
import { useState } from "react";

function ApproveUser({
    email,
    id,
}: {
    email: string;
    id: string;
}) {
    const [status, setStatus] = useState<"idle" | "approved" | "rejected" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function approve() {
        setStatus("idle");
        setErrorMessage(null);

        const formData = new FormData();
        formData.append("id", id);

        try {
            await approveUser(formData);
            setStatus("approved");
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err?.message || "An error occurred");
        }
    }
    async function reject() {
        setStatus("idle");
        setErrorMessage(null);

        const formData = new FormData();
        formData.append("id", id);

        try {
            await rejectUser(formData);
            setStatus("rejected");
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err?.message || "An error occurred");
        }
    }

    let result = null;
    if (status === "approved") result = <span style={{ color: "green", fontWeight: "bold" }}>Approved</span>;
    if (status === "rejected") result = <span style={{ color: "red", fontWeight: "bold" }}>Rejected</span>;
    if (status === "error") result = <span style={{ color: "red" }}>{errorMessage}</span>;

    return (
        <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span>{email}</span>
            {(status === "idle" || status === "error") && (
                <>
                    <button
                        onClick={approve}
                        className="px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold text-lg"
                        type="submit"
                    >
                        Approve
                    </button>
                    <button
                        onClick={reject}
                        className="px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-semibold text-lg"
                        type="submit"
                    >
                        Reject
                    </button>
                </>
            )}
            {result}
        </li>
    );
}

export default function SettingsClient({
    usersToApprove,
}: {
    usersToApprove: { email: string; id: string }[];
}) {
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
                {usersToApprove.length > 0 && (
                    <div className={styles.usersToApprove}>
                        <h1 className={styles.bodyTitle}> Users to Approve </h1>
                        <div className={styles.bodyContent}>
                            <ul>
                                {
                                    usersToApprove.map((user) => (
                                        <ApproveUser
                                            key={user.id}
                                            email={user.email}
                                            id={user.id}
                                        />
                                    ))
                                }
                            </ul>
                        </div>
                    </div>
                )}

                <div className={styles.logOut}>
                    <LogOutButton/>
                </div>
            </div>
        </main>
    );
}