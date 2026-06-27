using System.Collections.Generic;
using System.Linq;
using azure_fd_app_2.Models;

namespace azure_fd_app_2.Services;

public class ProductService
{
    private readonly List<Product> _products;

    public ProductService()
    {
        _products = new List<Product>(); // Empty as Products page should be empty
    }

    public List<Product> GetAllProducts() => _products;

    public Product? GetProductById(int id) => _products.FirstOrDefault(p => p.Id == id);

    public List<Product> GetProductsByCategory(string category)
    {
        return _products;
    }
}
