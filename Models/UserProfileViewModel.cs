namespace azure_fd_app_2.Models;

public class UserProfileViewModel
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Picture { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public bool EmailVerified { get; set; }
    public string Nickname { get; set; } = string.Empty;
    public string IdentityProvider { get; set; } = "Auth0";
    public List<UserClaimItem> Claims { get; set; } = new();
}

public class UserClaimItem
{
    public string Type { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
