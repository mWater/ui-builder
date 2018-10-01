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

## Outstanding issues

- How do required fields get enforced? Is it a widget resposibility or a table responsibility? 

- How to get context vars across widget boundaries? Can they be other than row or rowset?

## How to add a new block type

- Create block def and block in the blocks folder
- Add to BlockFactory
- Add to palette

## Actions

Actions are things that buttons, etc perform.

- openModal (widget, contextVar values)
- addRow (table, column values)
- deleteRow (table, row id)
- gotoUrl (url, exprs)
- close (closes current view)

