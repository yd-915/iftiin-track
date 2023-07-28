import React, { useEffect } from "react";

import { useRouter } from "next/router";

// icons
import { PlusIcon } from "@heroicons/react/24/outline";
// layouts
import { WorkspaceAuthorizationLayout } from "layouts/auth-layout";
// hooks
import useProjects from "hooks/use-projects";
import useMyIssuesFilters from "hooks/my-issues/use-my-issues-filter";
// components
import { MyIssuesView, MyIssuesViewOptions } from "components/issues";
// ui
import { PrimaryButton } from "components/ui";
import { Breadcrumbs, BreadcrumbItem } from "components/breadcrumbs";
// types
import type { NextPage } from "next";
import useUser from "hooks/use-user";

const MyIssuesPage: NextPage = () => {
  const router = useRouter();
  const { workspaceSlug } = router.query;

  const { projects } = useProjects();
  const { user } = useUser();

  const { filters, setFilters } = useMyIssuesFilters(workspaceSlug?.toString());

  const tabsList = [
    {
      key: "assigned",
      label: "Assigned to me",
      selected: (filters?.assignees ?? []).length > 0,
      onClick: () => {
        setFilters({
          assignees: [user?.id ?? ""],
          created_by: null,
        });
      },
    },
    {
      key: "created",
      label: "Created by me",
      selected: (filters?.created_by ?? []).length > 0,
      onClick: () => {
        setFilters({
          created_by: [user?.id ?? ""],
          assignees: null,
        });
      },
    },
  ];

  useEffect(() => {
    if (!filters || !user) return;

    if (!filters.assignees && !filters.created_by) {
      setFilters({
        assignees: [user.id],
      });
      return;
    }
  }, [filters, setFilters, user]);

  return (
    <WorkspaceAuthorizationLayout
      breadcrumbs={
        <Breadcrumbs>
          <BreadcrumbItem title="My Issues" />
        </Breadcrumbs>
      }
      right={
        <div className="flex items-center gap-2">
          <MyIssuesViewOptions />
          <PrimaryButton
            className="flex items-center gap-2"
            onClick={() => {
              const e = new KeyboardEvent("keydown", { key: "c" });
              document.dispatchEvent(e);
            }}
          >
            <PlusIcon className="h-4 w-4" />
            Add Issue
          </PrimaryButton>
        </div>
      }
    >
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="px-4 sm:px-5 border-b border-custom-border-300">
          <div className="flex items-center overflow-x-scroll">
            {tabsList.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={tab.onClick}
                className={`border-b-2 p-4 text-sm font-medium outline-none whitespace-nowrap ${
                  tab.selected
                    ? "border-custom-primary-100 text-custom-primary-100"
                    : "border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <MyIssuesView />
      </div>
    </WorkspaceAuthorizationLayout>
  );
};

export default MyIssuesPage;
