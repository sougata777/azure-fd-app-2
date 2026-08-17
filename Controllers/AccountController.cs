using Auth0.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using azure_fd_app_2.Models;

namespace azure_fd_app_2.Controllers;

public class AccountController : Controller
{
    public async Task Login(string returnUrl = "/", string? connection = null)
    {
        var propertiesBuilder = new LoginAuthenticationPropertiesBuilder()
            .WithRedirectUri(returnUrl);

        if (!string.IsNullOrWhiteSpace(connection))
        {
            propertiesBuilder.WithParameter("connection", connection);
        }

        var authenticationProperties = propertiesBuilder.Build();

        await HttpContext.ChallengeAsync(Auth0Constants.AuthenticationScheme, authenticationProperties);
    }

    public async Task SignUp(string returnUrl = "/", string? connection = null)
    {
        var propertiesBuilder = new LoginAuthenticationPropertiesBuilder()
            .WithRedirectUri(returnUrl)
            .WithParameter("screen_hint", "signup");

        if (!string.IsNullOrWhiteSpace(connection))
        {
            propertiesBuilder.WithParameter("connection", connection);
        }

        var authenticationProperties = propertiesBuilder.Build();

        await HttpContext.ChallengeAsync(Auth0Constants.AuthenticationScheme, authenticationProperties);
    }

    public async Task Signup(string returnUrl = "/", string? connection = null) => await SignUp(returnUrl, connection);


    [Authorize]
    public async Task Logout()
    {
        var authenticationProperties = new LogoutAuthenticationPropertiesBuilder()
            .WithRedirectUri(Url.Action("Index", "Home") ?? "/")
            .Build();

        await HttpContext.SignOutAsync(Auth0Constants.AuthenticationScheme, authenticationProperties);
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    }

    [Authorize]
    public IActionResult Profile()
    {
        var userIdentity = User.Identity;
        
        var profile = new UserProfileViewModel
        {
            Name = User.FindFirst(c => c.Type == ClaimTypes.Name || c.Type == "name")?.Value ?? User.Identity?.Name ?? "User",
            Email = User.FindFirst(c => c.Type == ClaimTypes.Email || c.Type == "email")?.Value ?? "",
            Picture = User.FindFirst(c => c.Type == "picture")?.Value ?? "",
            UserId = User.FindFirst(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "sub")?.Value ?? "",
            EmailVerified = bool.TryParse(User.FindFirst(c => c.Type == "email_verified")?.Value, out var verified) && verified,
            Nickname = User.FindFirst(c => c.Type == "nickname")?.Value ?? "",
            IdentityProvider = GetIdentityProvider(User.FindFirst(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "sub")?.Value),
            Claims = User.Claims.Select(c => new UserClaimItem { Type = c.Type, Value = c.Value }).ToList()
        };

        return View(profile);
    }

    private static string GetIdentityProvider(string? sub)
    {
        if (string.IsNullOrEmpty(sub)) return "Auth0";
        if (sub.StartsWith("google-oauth2|")) return "Google";
        if (sub.StartsWith("github|")) return "GitHub";
        if (sub.StartsWith("facebook|")) return "Facebook";
        if (sub.StartsWith("windowslive|") || sub.StartsWith("waad|")) return "Microsoft";
        if (sub.StartsWith("apple|")) return "Apple";
        if (sub.StartsWith("twitter|")) return "Twitter";
        if (sub.StartsWith("auth0|")) return "Auth0 Database";
        return "Social Provider";
    }
}
