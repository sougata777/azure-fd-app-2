using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using azure_fd_app_2.Models;
using azure_fd_app_2.Services;

namespace azure_fd_app_2.Controllers;

public class HomeController : Controller
{
    private readonly ProductService _productService;

    public HomeController(ProductService productService)
    {
        _productService = productService;
    }

    public IActionResult Index()
    {
        return View();
    }

    [Route("products")]
    public IActionResult Products()
    {
        var products = _productService.GetAllProducts();
        return View(products);
    }

    [Route("about")]
    public IActionResult About()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
