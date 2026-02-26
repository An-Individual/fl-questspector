export const QuestStates = {
    Undefined: 0,
    NotStart: 1,
    InProgress: 2,
    Blocked: 3,
    Completed: 4,
    HiddenStatus: 5
}

export const QuestSortPriority = {
    [QuestStates.InProgress]: 1,
    [QuestStates.Blocked]: 2,
    [QuestStates.NotStart]: 3,
    [QuestStates.HiddenStatus]: 4,
    [QuestStates.Completed]: 5,
    [QuestStates.Undefined]: 6
}

export const LogicTypes = {
    Undefined: 0,
    Comparison: 1,
    And: 2,
    Or: 3,
    Not: 4
}

export const ComparisonTypes = {
    Undefined: 0,
    Equal: 1,
    NotEqual: 2,
    Greater: 3,
    GreaterEqual: 4,
    Less: 5,
    LessEqual: 6
}

export const ValueTypes = {
    Undefined: 0,
    Integer: 1,
    Quality: 2
}

export const AllowedQualityProperties = [
    "level",
    "effectiveLevel",
    "baseLevel",
    "cap"
]