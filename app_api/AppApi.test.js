const appApi = require("./AppApi");

describe("appApi", () => {
    test("addRole", async () => {
        await Promise.all(
            [
                {
                    state: {
                        client: {
                            guilds: {
                                fetch: () => ({
                                    roles: {
                                        fetch: () => ({
                                            cache: [
                                                { name: "role1", id: 1 },
                                                { name: "role2", id: 2 },
                                            ],
                                        }),
                                    },
                                }),
                            },
                        },
                        discordApi: { addRole: () => true },
                    },
                    req: { body: { role: "role2" } },
                    res: {
                        statusValue: 200,
                        status: function (status) {
                            this.statusValue = status;
                        },
                        json: function (json) {
                            return { status: this.statusValue, json };
                        },
                    },
                    expectedResult: { status: 200, json: { result: "added" } },
                },
                {
                    state: {
                        client: {
                            guilds: {
                                fetch: () => ({
                                    roles: {
                                        fetch: () => ({
                                            cache: [
                                                { name: "role1", id: 1 },
                                                { name: "role2", id: 2 },
                                            ],
                                        }),
                                    },
                                }),
                            },
                        },
                        discordApi: { addRole: () => false },
                    },
                    req: { body: { role: "role2" } },
                    res: {
                        statusValue: 200,
                        status: function (status) {
                            this.statusValue = status;
                        },
                        json: function (json) {
                            return { status: this.statusValue, json };
                        },
                    },
                    expectedResult: { status: 500, json: { result: "error" } },
                },
                {
                    state: {
                        client: {
                            guilds: {
                                fetch: () => ({
                                    roles: {
                                        fetch: () => ({
                                            cache: [
                                                { name: "role1", id: 1 },
                                                { name: "role2", id: 2 },
                                            ],
                                        }),
                                    },
                                }),
                            },
                        },
                        discordApi: { addRole: () => false },
                    },
                    req: { body: { role: "role3" } },
                    res: {
                        statusValue: 200,
                        status: function (status) {
                            this.statusValue = status;
                        },
                        json: function (json) {
                            return { status: this.statusValue, json };
                        },
                    },
                    expectedResult: { status: 400, json: { result: "role not found" } },
                },
            ].map(async (test) => {
                expect(await appApi.addRole(test.state)(test.req, test.res)).toStrictEqual(
                    test.expectedResult
                );
            })
        );
    });
});
