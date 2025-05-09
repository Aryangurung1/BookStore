using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookHeaven.Migrations
{
    /// <inheritdoc />
    public partial class AddPageCountToBook : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PageCount",
                table: "Books",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.InsertData(
                table: "Admins",
                columns: new[] { "AdminId", "Email", "FullName", "PasswordHash" },
                values: new object[] { 1, "admin@bookheaven.com", "System Administrator", "$2a$11$Pu4/4jjKrYaFAqMSazPWi.EpTa5dasGYEWS.64FyhoCkBEFtoxp22" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Admins",
                keyColumn: "AdminId",
                keyValue: 1);

            migrationBuilder.DropColumn(
                name: "PageCount",
                table: "Books");
        }
    }
}
