# AngularCRUDTables

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.2.

## Database Server

The mock database server is built using [Faker](https://fakerjs.dev/) and stores its data in:

```
./server/database.json
```

To generate you own data for the server, run:

```bash
npm run generate
```

To start the server, run:

```bash
npm run server
```

The server will listen on:

```
http://localhost:3000/
```

## Development Server

To start the Angular development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to:

```
http://localhost:4200/
```

The application will automatically reload whenever you modify any of the source files.

## Usage

This application demonstrates how Angular can be used to perform full CRUD operations on a table of items.

### Instructions

1. **Create an Item**  
   Click the **"New Product"** button in the top-left corner. Items are added in FIFO order, so newly added items appear on the last page of the table.

2. **Read Items**  
   All items are displayed using Angular's [`mat-table`](https://v5.material.angular.dev/components/table/overview) component.

3. **Update an Item**  
   Use the **"Update"** button located to the right of each item's quantity field to edit the item.

4. **Delete an Item**  
   Click the **"Delete"** button located to the right of the item's "Update" button to remove it from the database.

5. **Manually Refresh**  
   To reload all products from the database, click the **"Refresh Products from DB"** button.

Notes:
AI was used to debug and edit the README.md file. The rest of the work is my own.
