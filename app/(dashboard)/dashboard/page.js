"use client";

import { useState } from "react";
import SmtpConfig from "./components/SmtpConfig";
import EmailTemplates from "./components/EmailTemplates";
import TestEmail from "./components/TestEmail";
import EmailLogs from "./components/EmailLogs";
import ApiKeys from "./components/ApiKeys";
import ContactGroups from "./components/ContactGroups";
import ApiDocs from "./components/ApiDocs";
import { LogOut } from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { signOutAction } from "@/lib/actions/authentication";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("smtp");
    const { user } = useSession();

  const tabs = [
    { id: "smtp", name: "SMTP Configuration" },
    { id: "templates", name: "Email Templates" },
    { id: "test", name: "Test Email" },
    { id: "logs", name: "Email Logs" },
    { id: "api-keys", name: "API Keys" },
    { id: "contact-groups", name: "Contact Groups" },
    { id: "api-docs", name: "API Documentation" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "smtp":
        return <SmtpConfig />;
      case "templates":
        return <EmailTemplates />;
      case "test":
        return <TestEmail />;
      case "logs":
        return <EmailLogs />;
      case "api-keys":
        return <ApiKeys />;
      case "contact-groups":
        return <ContactGroups />;
      case "api-docs":
        return <ApiDocs />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            {/* Tabs */}
            <div className="border-b border-gray-200 flex items-center justify-between">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                        ${
                          activeTab === tab.id
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }
                      `}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
              {user && (
                <LogOut
                  size={48}
                  strokeWidth={1}
                  className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer"
                  onClick={async () => {
                    const result = await signOutAction();
                    if (result) {
                      window.location.href = "/auth/signin";
                    }
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className="p-6">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
