using Auth0.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<azure_fd_app_2.Services.ProductService>();

// Add Auth0 Web App Authentication
builder.Services.AddAuth0WebAppAuthentication(options =>
{
    options.Domain = builder.Configuration["Auth0:Domain"] ?? "dev-chpq5qn5.us.auth0.com";
    options.ClientId = builder.Configuration["Auth0:ClientId"] ?? "feuwk5qu92SG1L1bbjpY23yOrCop7L2A";
    var clientSecret = builder.Configuration["Auth0:ClientSecret"];
    if (!string.IsNullOrWhiteSpace(clientSecret))
    {
        options.ClientSecret = clientSecret;
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();

