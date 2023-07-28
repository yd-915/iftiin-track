import React from "react";

import { useRouter } from "next/router";

// headless ui
import { Popover, Transition } from "@headlessui/react";
// hooks
import useProfileIssues from "hooks/use-profile-issues";
import useEstimateOption from "hooks/use-estimate-option";
// components
import { MyIssuesSelectFilters } from "components/issues";
// ui
import { CustomMenu, ToggleSwitch, Tooltip } from "components/ui";
// icons
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FormatListBulletedOutlined, GridViewOutlined } from "@mui/icons-material";
// helpers
import { replaceUnderscoreIfSnakeCase } from "helpers/string.helper";
import { checkIfArraysHaveSameElements } from "helpers/array.helper";
// types
import { Properties, TIssueViewOptions } from "types";
// constants
import { GROUP_BY_OPTIONS, ORDER_BY_OPTIONS, FILTER_ISSUE_OPTIONS } from "constants/issue";

const issueViewOptions: { type: TIssueViewOptions; Icon: any }[] = [
  {
    type: "list",
    Icon: FormatListBulletedOutlined,
  },
  {
    type: "kanban",
    Icon: GridViewOutlined,
  },
];

export const ProfileIssuesViewOptions: React.FC = () => {
  const router = useRouter();
  const { workspaceSlug, userId } = router.query;

  const {
    issueView,
    setIssueView,
    groupByProperty,
    setGroupByProperty,
    orderBy,
    setOrderBy,
    showEmptyGroups,
    setShowEmptyGroups,
    filters,
    properties,
    setProperties,
    setFilters,
  } = useProfileIssues(workspaceSlug?.toString(), userId?.toString());

  const { isEstimateActive } = useEstimateOption();

  if (
    !router.pathname.includes("assigned") &&
    !router.pathname.includes("created") &&
    !router.pathname.includes("subscribed")
  )
    return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-x-1">
        {issueViewOptions.map((option) => (
          <Tooltip
            key={option.type}
            tooltipContent={
              <span className="capitalize">{replaceUnderscoreIfSnakeCase(option.type)} View</span>
            }
            position="bottom"
          >
            <button
              type="button"
              className={`grid h-7 w-7 place-items-center rounded p-1 outline-none hover:bg-custom-sidebar-background-80 duration-300 ${
                issueView === option.type
                  ? "bg-custom-sidebar-background-80"
                  : "text-custom-sidebar-text-200"
              }`}
              onClick={() => setIssueView(option.type)}
            >
              <option.Icon
                sx={{
                  fontSize: 16,
                }}
                className={option.type === "gantt_chart" ? "rotate-90" : ""}
              />
            </button>
          </Tooltip>
        ))}
      </div>
      <MyIssuesSelectFilters
        filters={filters}
        onSelect={(option) => {
          const key = option.key as keyof typeof filters;

          if (key === "target_date") {
            const valueExists = checkIfArraysHaveSameElements(
              filters?.target_date ?? [],
              option.value
            );

            setFilters({
              target_date: valueExists ? null : option.value,
            });
          } else {
            const valueExists = filters[key]?.includes(option.value);

            if (valueExists)
              setFilters({
                [option.key]: ((filters[key] ?? []) as any[])?.filter(
                  (val) => val !== option.value
                ),
              });
            else
              setFilters({
                [option.key]: [...((filters[key] ?? []) as any[]), option.value],
              });
          }
        }}
        direction="left"
        height="rg"
      />
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              className={`group flex items-center gap-2 rounded-md border border-custom-sidebar-border-200 bg-transparent px-3 py-1.5 text-xs hover:bg-custom-sidebar-background-90 hover:text-custom-sidebar-text-100 focus:outline-none duration-300 ${
                open
                  ? "bg-custom-sidebar-background-90 text-custom-sidebar-text-100"
                  : "text-custom-sidebar-text-200"
              }`}
            >
              View
              <ChevronDownIcon className="h-3 w-3" aria-hidden="true" />
            </Popover.Button>

            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute right-0 z-30 mt-1 w-screen max-w-xs transform rounded-lg border border-custom-border-200 bg-custom-background-90 p-3 shadow-lg">
                <div className="relative divide-y-2 divide-custom-border-200">
                  <div className="space-y-4 pb-3 text-xs">
                    {issueView !== "calendar" && issueView !== "spreadsheet" && (
                      <>
                        <div className="flex items-center justify-between">
                          <h4 className="text-custom-text-200">Group by</h4>
                          <CustomMenu
                            label={
                              groupByProperty === "project"
                                ? "Project"
                                : GROUP_BY_OPTIONS.find((option) => option.key === groupByProperty)
                                    ?.name ?? "Select"
                            }
                          >
                            {GROUP_BY_OPTIONS.map((option) => {
                              if (issueView === "kanban" && option.key === null) return null;
                              if (option.key === "state" || option.key === "created_by")
                                return null;

                              return (
                                <CustomMenu.MenuItem
                                  key={option.key}
                                  onClick={() => setGroupByProperty(option.key)}
                                >
                                  {option.name}
                                </CustomMenu.MenuItem>
                              );
                            })}
                          </CustomMenu>
                        </div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-custom-text-200">Order by</h4>
                          <CustomMenu
                            label={
                              ORDER_BY_OPTIONS.find((option) => option.key === orderBy)?.name ??
                              "Select"
                            }
                          >
                            {ORDER_BY_OPTIONS.map((option) => {
                              if (groupByProperty === "priority" && option.key === "priority")
                                return null;
                              if (option.key === "sort_order") return null;

                              return (
                                <CustomMenu.MenuItem
                                  key={option.key}
                                  onClick={() => {
                                    setOrderBy(option.key);
                                  }}
                                >
                                  {option.name}
                                </CustomMenu.MenuItem>
                              );
                            })}
                          </CustomMenu>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between">
                      <h4 className="text-custom-text-200">Issue type</h4>
                      <CustomMenu
                        label={
                          FILTER_ISSUE_OPTIONS.find((option) => option.key === filters?.type)
                            ?.name ?? "Select"
                        }
                      >
                        {FILTER_ISSUE_OPTIONS.map((option) => (
                          <CustomMenu.MenuItem
                            key={option.key}
                            onClick={() =>
                              setFilters({
                                type: option.key,
                              })
                            }
                          >
                            {option.name}
                          </CustomMenu.MenuItem>
                        ))}
                      </CustomMenu>
                    </div>

                    {issueView !== "calendar" && issueView !== "spreadsheet" && (
                      <>
                        <div className="flex items-center justify-between">
                          <h4 className="text-custom-text-200">Show empty states</h4>
                          <ToggleSwitch value={showEmptyGroups} onChange={setShowEmptyGroups} />
                        </div>
                        {/* <div className="relative flex justify-end gap-x-3">
                          <button type="button" onClick={() => resetFilterToDefault()}>
                            Reset to default
                          </button>
                          <button
                            type="button"
                            className="font-medium text-custom-primary"
                            onClick={() => setNewFilterDefaultView()}
                          >
                            Set as default
                          </button>
                        </div> */}
                      </>
                    )}
                  </div>

                  <div className="space-y-2 py-3">
                    <h4 className="text-sm text-custom-text-200">Display Properties</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {Object.keys(properties).map((key) => {
                        if (key === "estimate" && !isEstimateActive) return null;

                        if (
                          issueView === "spreadsheet" &&
                          (key === "attachment_count" ||
                            key === "link" ||
                            key === "sub_issue_count")
                        )
                          return null;

                        if (
                          issueView !== "spreadsheet" &&
                          (key === "created_on" || key === "updated_on")
                        )
                          return null;

                        return (
                          <button
                            key={key}
                            type="button"
                            className={`rounded border px-2 py-1 text-xs capitalize ${
                              properties[key as keyof Properties]
                                ? "border-custom-primary bg-custom-primary text-white"
                                : "border-custom-border-200"
                            }`}
                            onClick={() => setProperties(key as keyof Properties)}
                          >
                            {key === "key" ? "ID" : replaceUnderscoreIfSnakeCase(key)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};
