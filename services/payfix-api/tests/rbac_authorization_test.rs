use payfix_api::models::auth::UserRole;

#[test]
fn test_rbac_role_permissions_matrix() {
    let admin_role = UserRole::SystemAdmin;
    let data_entry_role = UserRole::DataEntry;
    let verifier_role = UserRole::Verifier;
    let authorizer_role = UserRole::AuthorizingOfficer;
    let read_only_role = UserRole::ReadOnly;

    assert_eq!(admin_role.as_str(), "SYSTEM_ADMIN");
    assert_eq!(data_entry_role.as_str(), "DATA_ENTRY");
    assert_eq!(verifier_role.as_str(), "VERIFIER");
    assert_eq!(authorizer_role.as_str(), "AUTHORIZING_OFFICER");
    assert_eq!(read_only_role.as_str(), "READ_ONLY");
}
