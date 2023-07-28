import React from "react";

import { useRouter } from "next/router";

// hooks
import useWorkspaceMembers from "hooks/use-workspace-members";

// components
import { Icon, Tooltip } from "components/ui";
// helpers
import { getNumberCount } from "helpers/string.helper";

// type
import type { NotificationType, NotificationCount } from "types";

type NotificationHeaderProps = {
  notificationCount?: NotificationCount | null;
  notificationMutate: () => void;
  closePopover: () => void;
  isRefreshing?: boolean;
  snoozed: boolean;
  archived: boolean;
  readNotification: boolean;
  selectedTab: NotificationType;
  setSnoozed: React.Dispatch<React.SetStateAction<boolean>>;
  setArchived: React.Dispatch<React.SetStateAction<boolean>>;
  setReadNotification: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTab: React.Dispatch<React.SetStateAction<NotificationType>>;
};

export const NotificationHeader: React.FC<NotificationHeaderProps> = (props) => {
  const {
    notificationCount,
    notificationMutate,
    closePopover,
    isRefreshing,
    snoozed,
    archived,
    readNotification,
    selectedTab,
    setSnoozed,
    setArchived,
    setReadNotification,
    setSelectedTab,
  } = props;

  const router = useRouter();
  const { workspaceSlug } = router.query;

  const { isOwner, isMember } = useWorkspaceMembers(workspaceSlug?.toString() ?? "");

  const notificationTabs: Array<{
    label: string;
    value: NotificationType;
    unreadCount?: number;
  }> = [
    {
      label: "My Issues",
      value: "assigned",
      unreadCount: notificationCount?.my_issues,
    },
    {
      label: "Created by me",
      value: "created",
      unreadCount: notificationCount?.created_issues,
    },
    {
      label: "Subscribed",
      value: "watching",
      unreadCount: notificationCount?.watching_issues,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5">
        <h2 className="text-xl font-semibold mb-2">Notifications</h2>
        <div className="flex gap-x-4 justify-center items-center text-custom-text-200">
          <Tooltip tooltipContent="Refresh">
            <button
              type="button"
              onClick={() => {
                notificationMutate();
              }}
            >
              <Icon iconName="refresh" className={`${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </Tooltip>
          <Tooltip tooltipContent="Unread notifications">
            <button
              type="button"
              onClick={() => {
                setSnoozed(false);
                setArchived(false);
                setReadNotification((prev) => !prev);
              }}
            >
              <Icon iconName="filter_list" />
            </button>
          </Tooltip>
          <Tooltip tooltipContent="Snoozed notifications">
            <button
              type="button"
              onClick={() => {
                setArchived(false);
                setReadNotification(false);
                setSnoozed((prev) => !prev);
              }}
            >
              <Icon iconName="schedule" />
            </button>
          </Tooltip>
          <Tooltip tooltipContent="Archived notifications">
            <button
              type="button"
              onClick={() => {
                setSnoozed(false);
                setReadNotification(false);
                setArchived((prev) => !prev);
              }}
            >
              <Icon iconName="archive" />
            </button>
          </Tooltip>
          <button type="button" onClick={() => closePopover()}>
            <Icon iconName="close" />
          </button>
        </div>
      </div>
      <div className="border-b border-custom-border-300 w-full px-5 mt-5">
        {snoozed || archived || readNotification ? (
          <button
            type="button"
            onClick={() => {
              setSnoozed(false);
              setArchived(false);
              setReadNotification(false);
            }}
          >
            <h4 className="flex items-center gap-2 pb-4">
              <Icon iconName="arrow_back" />
              <span className="ml-2 font-medium">
                {snoozed
                  ? "Snoozed Notifications"
                  : readNotification
                  ? "Unread Notifications"
                  : "Archived Notifications"}
              </span>
            </h4>
          </button>
        ) : (
          <nav className="flex space-x-5 overflow-x-auto" aria-label="Tabs">
            {notificationTabs.map((tab) =>
              tab.value === "created" ? (
                isMember || isOwner ? (
                  <button
                    type="button"
                    key={tab.value}
                    onClick={() => setSelectedTab(tab.value)}
                    className={`whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium outline-none ${
                      tab.value === selectedTab
                        ? "border-custom-primary-100 text-custom-primary-100"
                        : "border-transparent text-custom-text-200"
                    }`}
                  >
                    {tab.label}
                    {tab.unreadCount && tab.unreadCount > 0 ? (
                      <span
                        className={`ml-2 rounded-full text-xs px-2 py-0.5 ${
                          tab.value === selectedTab
                            ? "bg-custom-primary-100 text-white"
                            : "bg-custom-background-80 text-custom-text-200"
                        }`}
                      >
                        {getNumberCount(tab.unreadCount)}
                      </span>
                    ) : null}
                  </button>
                ) : null
              ) : (
                <button
                  type="button"
                  key={tab.value}
                  onClick={() => setSelectedTab(tab.value)}
                  className={`whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium ${
                    tab.value === selectedTab
                      ? "border-custom-primary-100 text-custom-primary-100"
                      : "border-transparent text-custom-text-200"
                  }`}
                >
                  {tab.label}
                  {tab.unreadCount && tab.unreadCount > 0 ? (
                    <span
                      className={`ml-2 rounded-full text-xs px-2 py-0.5 ${
                        tab.value === selectedTab
                          ? "bg-custom-primary-100 text-white"
                          : "bg-custom-background-80 text-custom-text-200"
                      }`}
                    >
                      {getNumberCount(tab.unreadCount)}
                    </span>
                  ) : null}
                </button>
              )
            )}
          </nav>
        )}
      </div>
    </>
  );
};
