const DiscordApi = require("./DiscordApi");

describe("DiscordApi", () => {
    test("addRole", async () => {
        await Promise.all(
            [
                {
                    state: {
                        client: {
                            guilds: {
                                fetch: () => ({
                                    members: {
                                        fetch: () => ({ roles: { add: () => true } }),
                                    },
                                }),
                            },
                        },
                    },
                    req: { body: { user: "testUser" } },
                    res: {},
                    role: "testRole",
                    expectedResult: true,
                },
                {
                    state: {
                        client: {
                            guilds: {
                                fetch: () => ({
                                    members: {
                                        fetch: () => throw new Error(),
                                    },
                                }),
                            },
                        },
                    },
                    req: { body: { user: "testUser" } },
                    res: {},
                    role: "testRole",
                    expectedResult: false,
                },
                {
                    state: { client: { guilds: { fetch: () => throw new Error() } } },
                    req: { body: { user: "testUser" } },
                    res: {},
                    role: "testRole",
                    expectedResult: false,
                },
            ].map(async (test) =>
                expect(await DiscordApi.addRole(test.state, test.req, test.res, test.role)).toBe(
                    test.expectedResult
                )
            )
        );
    });

    test("removeRole", async () => {
        await Promise.all(
            [
                {
                    state: {
                        client: {
                            guilds: {
                                fetch: () => ({
                                    members: {
                                        fetch: () => ({ roles: { remove: () => true } }),
                                    },
                                }),
                            },
                        },
                    },
                    req: { body: { user: "testUser" } },
                    res: {},
                    role: "testRole",
                    expectedResult: true,
                },
                {
                    state: {
                        client: {
                            guilds: {
                                fetch: () => ({
                                    members: {
                                        fetch: () => throw new Error(),
                                    },
                                }),
                            },
                        },
                    },
                    req: { body: { user: "testUser" } },
                    res: {},
                    role: "testRole",
                    expectedResult: false,
                },
                {
                    state: { client: { guilds: { fetch: () => throw new Error() } } },
                    req: { body: { user: "testUser" } },
                    res: {},
                    role: "testRole",
                    expectedResult: false,
                },
            ].map(async (test) =>
                expect(await DiscordApi.removeRole(test.state, test.req, test.res, test.role)).toBe(
                    test.expectedResult
                )
            )
        );
    });
});
