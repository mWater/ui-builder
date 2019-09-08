# UI Builder

The goal of the UI Builder is to allow easy creation of relatively complex user interfaces using only drag and drop and thus
allow rapid iteration with clients.

Features include:

- Standard controls like text boxes, dropdowns, radio buttons
- Tables with multiple filters 
- Text with embedded expressions
- Repeated sections (e.g. repeat a group for each water point)
- Popups which can be shared between widgets
- Required fields and complex validation
- Tabs and collapsible sections
- Cascading selection of values
- Easy to embed custom controls
- Able to work in an offline mobile environment

Non-features:

- Does not include a scripting language. Custom work should be done as custom components

## Concepts

### Blocks

Blocks are the smallest item. They are a rectangular item on the screen such as a drop down box, text field, expression ,table, etc

Blocks may contain other blocks, but the method of embedding the children blocks is entirely up to the parent block.

### Context variables

Contacts variables are variable values that are passed down through the tree of blocks. They may be of the type `row` indicating a single 
row of a table. `rowset` is a Boolean expression determining which rows of a table are included in a set of rows. They can also be `text`,
`number`, etc and other literals.

A block may use one or more context variables. Furthermore, for row and rowset variables, the block may request the value of one or more
expressions based on the variable. For example, a text box may request the value of a text column of a row so that it doesn't have to query
it itself.

### Widgets

A widget contains a single block and has a human readable name. It also defines 0 or more contexts variables that will be passed to the block.

The purpose of the UI Builder is primarily to create widgets which represent pages of the website or that represents smaller pieces that can be reused.

### Widget Library

Collection of widgets. Usually an app will have a single widget Library that is serializable to Json.

## How to add a new block type

- Create block def and block in the blocks folder
- Add to BlockFactory in `widgets/BlockFactory.ts`
- Add to palette in `designer/blockPaletteEntries.tsx`

## Actions

Actions are things that buttons, etc perform.

- openModal (widget, contextVar values)
- addRow (table, column values)
- deleteRow (table, row id)
- gotoUrl (url, exprs)
- close (closes current view)

## Selectio