"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.Urgency = exports.RequestStatus = exports.UserMode = exports.BloodType = void 0;
var BloodType;
(function (BloodType) {
    BloodType["A_POSITIVE"] = "A+";
    BloodType["A_NEGATIVE"] = "A-";
    BloodType["B_POSITIVE"] = "B+";
    BloodType["B_NEGATIVE"] = "B-";
    BloodType["AB_POSITIVE"] = "AB+";
    BloodType["AB_NEGATIVE"] = "AB-";
    BloodType["O_POSITIVE"] = "O+";
    BloodType["O_NEGATIVE"] = "O-";
})(BloodType || (exports.BloodType = BloodType = {}));
var UserMode;
(function (UserMode) {
    UserMode["DONOR"] = "donor";
    UserMode["SEEKER"] = "seeker";
    UserMode["BOTH"] = "both";
})(UserMode || (exports.UserMode = UserMode = {}));
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["OPEN"] = "open";
    RequestStatus["ACCEPTED"] = "accepted";
    RequestStatus["CANCELLED"] = "cancelled";
    RequestStatus["COMPLETED"] = "completed";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
var Urgency;
(function (Urgency) {
    Urgency["STANDARD"] = "standard";
    Urgency["NORMAL"] = "normal";
    Urgency["URGENT"] = "urgent";
    Urgency["CRITICAL"] = "critical";
})(Urgency || (exports.Urgency = Urgency = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["REQUEST_MATCH"] = "request_match";
    NotificationType["REQUEST_ACCEPTED"] = "request_accepted";
    NotificationType["ELIGIBILITY_REMINDER"] = "eligibility_reminder";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
//# sourceMappingURL=blood-type.enum.js.map