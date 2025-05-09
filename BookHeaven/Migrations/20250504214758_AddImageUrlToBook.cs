using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookHeaven.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToBook : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ReviewDate",
                table: "Reviews",
                newName: "CreatedAt");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Books",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Books");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Reviews",
                newName: "ReviewDate");
        }
    }
}
