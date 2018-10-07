import SearchBlockInstance from "./SearchBlockInstance";
import { shallow } from "enzyme";
import * as React from "react";
const getFilter = (blockDef, searchText) => {
    return new Promise((resolve, reject) => {
        // Create minimal renderInstanceProps
        const renderInstanceProps = {
            setFilter: (contextVarId, filter) => {
                resolve({ contextVarId: contextVarId, filter: filter });
            },
            contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
        };
        const sbi = shallow(React.createElement(SearchBlockInstance, { blockDef: blockDef, renderInstanceProps: renderInstanceProps }));
        sbi.find("input").simulate("change", { target: { value: searchText } });
    });
};
test("creates search on single expression", async () => {
    const searchExprs = [
        { type: "field", table: "t1", column: "text" }
    ];
    const filter = await getFilter({ id: "s", rowsetContextVarId: "cv1", searchExprs: searchExprs, type: "search", placeholder: null }, "xyz*");
    expect(filter).toEqual({
        contextVarId: "cv1",
        filter: {
            id: "s",
            expr: {
                type: "op",
                table: "t1",
                op: "or",
                exprs: [
                    {
                        type: "op",
                        table: "t1",
                        op: "~*",
                        exprs: [
                            searchExprs[0],
                            { type: "literal", valueType: "text", value: "xyz\\*" }
                        ]
                    }
                ]
            }
        }
    });
});
//# sourceMappingURL=SearchBlockInstance.test.js.map