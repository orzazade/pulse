"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompatibleDonorTypes = getCompatibleDonorTypes;
exports.canDonate = canDonate;
const blood_type_enum_1 = require("../enums/blood-type.enum");
const COMPATIBILITY_MAP = {
    [blood_type_enum_1.BloodType.AB_POSITIVE]: [blood_type_enum_1.BloodType.A_POSITIVE, blood_type_enum_1.BloodType.A_NEGATIVE, blood_type_enum_1.BloodType.B_POSITIVE, blood_type_enum_1.BloodType.B_NEGATIVE, blood_type_enum_1.BloodType.AB_POSITIVE, blood_type_enum_1.BloodType.AB_NEGATIVE, blood_type_enum_1.BloodType.O_POSITIVE, blood_type_enum_1.BloodType.O_NEGATIVE],
    [blood_type_enum_1.BloodType.AB_NEGATIVE]: [blood_type_enum_1.BloodType.A_NEGATIVE, blood_type_enum_1.BloodType.B_NEGATIVE, blood_type_enum_1.BloodType.AB_NEGATIVE, blood_type_enum_1.BloodType.O_NEGATIVE],
    [blood_type_enum_1.BloodType.A_POSITIVE]: [blood_type_enum_1.BloodType.A_POSITIVE, blood_type_enum_1.BloodType.A_NEGATIVE, blood_type_enum_1.BloodType.O_POSITIVE, blood_type_enum_1.BloodType.O_NEGATIVE],
    [blood_type_enum_1.BloodType.A_NEGATIVE]: [blood_type_enum_1.BloodType.A_NEGATIVE, blood_type_enum_1.BloodType.O_NEGATIVE],
    [blood_type_enum_1.BloodType.B_POSITIVE]: [blood_type_enum_1.BloodType.B_POSITIVE, blood_type_enum_1.BloodType.B_NEGATIVE, blood_type_enum_1.BloodType.O_POSITIVE, blood_type_enum_1.BloodType.O_NEGATIVE],
    [blood_type_enum_1.BloodType.B_NEGATIVE]: [blood_type_enum_1.BloodType.B_NEGATIVE, blood_type_enum_1.BloodType.O_NEGATIVE],
    [blood_type_enum_1.BloodType.O_POSITIVE]: [blood_type_enum_1.BloodType.O_POSITIVE, blood_type_enum_1.BloodType.O_NEGATIVE],
    [blood_type_enum_1.BloodType.O_NEGATIVE]: [blood_type_enum_1.BloodType.O_NEGATIVE],
};
function getCompatibleDonorTypes(recipientBloodType) {
    return COMPATIBILITY_MAP[recipientBloodType] ?? [];
}
function canDonate(donorType, recipientType) {
    return getCompatibleDonorTypes(recipientType).includes(donorType);
}
//# sourceMappingURL=blood-type.util.js.map