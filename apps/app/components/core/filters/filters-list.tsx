import React from "react";

// icons
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getPriorityIcon, getStateGroupIcon } from "components/icons";
// ui
import { Avatar } from "components/ui";
// helpers
import { replaceUnderscoreIfSnakeCase } from "helpers/string.helper";
// helpers
import { renderShortDateWithYearFormat } from "helpers/date-time.helper";
// types
import { IIssueFilterOptions, IIssueLabels, IState, IUserLite, TStateGroups } from "types";
// constants
import { STATE_GROUP_COLORS } from "constants/state";

type Props = {
  filters: Partial<IIssueFilterOptions>;
  setFilters: (updatedFilter: Partial<IIssueFilterOptions>) => void;
  clearAllFilters: (...args: any) => void;
  labels: IIssueLabels[] | undefined;
  members: IUserLite[] | undefined;
  states: IState[] | undefined;
};

export const FiltersList: React.FC<Props> = ({
  filters,
  setFilters,
  clearAllFilters,
  labels,
  members,
  states,
}) => {
  if (!filters) return <></>;

  const nullFilters = Object.keys(filters).filter(
    (key) => filters[key as keyof IIssueFilterOptions] === null
  );

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2 text-xs">
      {Object.keys(filters).map((filterKey) => {
        const key = filterKey as keyof typeof filters;

        if (filters[key] === null) return null;

        return (
          <div
            key={key}
            className="flex items-center gap-x-2 rounded-full border border-custom-border-200 bg-custom-background-80 px-2 py-1"
          >
            <span className="capitalize text-custom-text-200">
              {key === "target_date" ? "Due Date" : replaceUnderscoreIfSnakeCase(key)}:
            </span>
            {filters[key] === null || (filters[key]?.length ?? 0) <= 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 font-medium">None</span>
            ) : Array.isArray(filters[key]) ? (
              <div className="space-x-2">
                <div className="flex flex-wrap items-center gap-1">
                  {key === "state"
                    ? filters.state?.map((stateId: string) => {
                        const state = states?.find((s) => s.id === stateId);

                        return (
                          <p
                            key={state?.id}
                            className="inline-flex items-center gap-x-1 rounded-full px-2 py-0.5 font-medium"
                            style={{
                              color: state?.color,
                              backgroundColor: `${state?.color}20`,
                            }}
                          >
                            <span>
                              {getStateGroupIcon(
                                state?.group ?? "backlog",
                                "12",
                                "12",
                                state?.color
                              )}
                            </span>
                            <span>{state?.name ?? ""}</span>
                            <span
                              className="cursor-pointer"
                              onClick={() =>
                                setFilters({
                                  state: filters.state?.filter((s: any) => s !== stateId),
                                })
                              }
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </span>
                          </p>
                        );
                      })
                    : key === "state_group"
                    ? filters.state_group?.map((stateGroup) => {
                        const group = stateGroup as TStateGroups;

                        return (
                          <p
                            key={group}
                            className="inline-flex items-center gap-x-1 rounded-full px-2 py-0.5 capitalize"
                            style={{
                              color: STATE_GROUP_COLORS[group],
                              backgroundColor: `${STATE_GROUP_COLORS[group]}20`,
                            }}
                          >
                            <span>{getStateGroupIcon(group, "16", "16")}</span>
                            <span>{group}</span>
                            <span
                              className="cursor-pointer"
                              onClick={() =>
                                setFilters({
                                  state_group: filters.state_group?.filter((g) => g !== group),
                                })
                              }
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </span>
                          </p>
                        );
                      })
                    : key === "priority"
                    ? filters.priority?.map((priority: any) => (
                        <p
                          key={priority}
                          className={`inline-flex items-center gap-x-1 rounded-full px-2 py-0.5 capitalize ${
                            priority === "urgent"
                              ? "bg-red-500/20 text-red-500"
                              : priority === "high"
                              ? "bg-orange-500/20 text-orange-500"
                              : priority === "medium"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : priority === "low"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-custom-background-90 text-custom-text-200"
                          }`}
                        >
                          <span>{getPriorityIcon(priority)}</span>
                          <span>{priority === "null" ? "None" : priority}</span>
                          <span
                            className="cursor-pointer"
                            onClick={() =>
                              setFilters({
                                priority: filters.priority?.filter((p: any) => p !== priority),
                              })
                            }
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </span>
                        </p>
                      ))
                    : key === "assignees"
                    ? filters.assignees?.map((memberId: string) => {
                        const member = members?.find((m) => m.id === memberId);

                        return (
                          <div
                            key={memberId}
                            className="inline-flex items-center gap-x-1 rounded-full bg-custom-background-90 px-1 capitalize"
                          >
                            <Avatar user={member} />
                            <span>{member?.first_name}</span>
                            <span
                              className="cursor-pointer"
                              onClick={() =>
                                setFilters({
                                  assignees: filters.assignees?.filter((p: any) => p !== memberId),
                                })
                              }
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </span>
                          </div>
                        );
                      })
                    : key === "created_by"
                    ? filters.created_by?.map((memberId: string) => {
                        const member = members?.find((m) => m.id === memberId);

                        return (
                          <div
                            key={`${memberId}-${key}`}
                            className="inline-flex items-center gap-x-1 rounded-full bg-custom-background-90 px-1 capitalize"
                          >
                            <Avatar user={member} />
                            <span>{member?.first_name}</span>
                            <span
                              className="cursor-pointer"
                              onClick={() =>
                                setFilters({
                                  created_by: filters.created_by?.filter(
                                    (p: any) => p !== memberId
                                  ),
                                })
                              }
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </span>
                          </div>
                        );
                      })
                    : key === "labels"
                    ? filters.labels?.map((labelId: string) => {
                        const label = labels?.find((l) => l.id === labelId);

                        if (!label) return null;
                        const color = label.color !== "" ? label.color : "#0f172a";
                        return (
                          <div
                            className="inline-flex items-center gap-x-1 rounded-full px-2 py-0.5"
                            style={{
                              color: color,
                              backgroundColor: `${color}20`, // add 20% opacity
                            }}
                            key={labelId}
                          >
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor: color,
                              }}
                            />
                            <span>{label.name}</span>
                            <span
                              className="cursor-pointer"
                              onClick={() =>
                                setFilters({
                                  labels: filters.labels?.filter((l: any) => l !== labelId),
                                })
                              }
                            >
                              <XMarkIcon
                                className="h-3 w-3"
                                style={{
                                  color: color,
                                }}
                              />
                            </span>
                          </div>
                        );
                      })
                    : key === "target_date"
                    ? filters.target_date?.map((date: string) => {
                        if (filters.target_date && filters.target_date.length <= 0) return null;

                        const splitDate = date.split(";");

                        return (
                          <div
                            key={date}
                            className="inline-flex items-center gap-x-1 rounded-full border border-custom-border-200 bg-custom-background-100 px-1 py-0.5"
                          >
                            <div className="h-1.5 w-1.5 rounded-full" />
                            <span className="capitalize">
                              {splitDate[1]} {renderShortDateWithYearFormat(splitDate[0])}
                            </span>
                            <span
                              className="cursor-pointer"
                              onClick={() =>
                                setFilters({
                                  target_date: filters.target_date?.filter((d: any) => d !== date),
                                })
                              }
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </span>
                          </div>
                        );
                      })
                    : (filters[key] as any)?.join(", ")}
                  <button
                    type="button"
                    onClick={() =>
                      setFilters({
                        [key]: null,
                      })
                    }
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-x-1 capitalize">
                {filters[key as keyof typeof filters]}
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      [key]: null,
                    })
                  }
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
      {Object.keys(filters).length > 0 && nullFilters.length !== Object.keys(filters).length && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="flex items-center gap-x-1 rounded-full border border-custom-border-200 bg-custom-background-80 px-3 py-1.5 text-xs"
        >
          <span>Clear all filters</span>
          <XMarkIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
