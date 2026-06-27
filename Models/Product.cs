using System.Collections.Generic;

namespace azure_fd_app_2.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string LongDescription { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public double Rating { get; set; }
    public List<string> Specs { get; set; } = new();
    public bool IsBestSeller { get; set; }
    public bool IsNew { get; set; }
}
