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
- How to create context-specific palette for deep objects? (search tree and get created context vars)

- Maybe store widget instance state separate from widget instance? Allow widget to manipulate? Easy state capturing?

- How do required fields get enforced? Is it a widget resposibility or a table responsibility? 

- How to get context vars across widget boundaries? Can they be other than row or rowset?



## Actions

Actions are things that buttons, etc perform.

- openModal (widget, contextVar values)
- addRow (table, column values)
- deleteRow (table, row id)
- gotoUrl (url, exprs)
- close (closes current view)

