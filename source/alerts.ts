export interface IAlert<Type extends string>
{
    /**
     * The type of alert
     */
    type: Type
}

/**
 * An alert when the user configures ko-fi
 */
export interface IConfigAlert extends IAlert<"config">
{
    
}

/**
 * An alert containing information about a donation alert
 */
export interface IDonationAlert extends IAlert<"donation">
{
    /**
     * The raw HTML code of the alert
     */
    raw: string
    /**
     * The image of the alert
     */
    image?: string
    /**
     * Text-To-Speech message if present
     */
    tts?: string
    /**
     * The name of the user
     */
    username: string
    /**
     * The amount of money donated by the user
     */
    amount: number
}

/**
 * Contains types that ko-fi uses for their alerts
 */
export namespace KoFi
{
    /**
     * Base interface for all activities
     * @see {@link ShopActivity}
     * @see {@link CommissionActivity}
     * @see {@link MembershipActivity}
     * @see {@link DonationActivity}
     */
    export interface Activity
    {
        // These properties are not visible to a normal user
        /**
         * UNIX timestamp when the alert happend?
         */
        AlertTimestamp: number
        /**
         * Is this a test activity?
         */
        IsTestActivity: boolean
        /**
         * The UUID of the transaction
         */
        TransactionId: string
        /**
         * UNIX timestamp of when the transaction happend?
         */
        // These properties are visible to a normal user
        Timestamp: number
        /**
         * The name of the user
         */
        UserName: string
        /**
         * The amount of money that was used for the transaction (as a string for some odd reason?)
         */
        Amount: string
        /**
         * The currency that was used for the transaction
         */
        Currency: string
        /**
         * The user's Twitch username if it exists
         */
        TwitchUsername?: string
        /**
         * The message of the user if it exists
         */
        Message?: string
        /**
         * Is this a public message that is viewable by anyone?
         */
        IsMessagePublic: boolean
    }
    
    /**
     * An activity when a user bought an item in the shop
     */
    export interface ShopActivity extends Activity
    {
        /**
         * The type of transaction
         */
        TransactionType: "Shop item"
        /**
         * The name of the item in the shop
         */
        ShopItemName: string
    }
    /**
     * An activity when a user bought a commission
     */
    export interface CommissionActivity extends Activity
    {
        /**
         * The type of transaction
         */
        TransactionType: "Commission"
        /**
         * THe name of the commission
         */
        ShopItemName: string
    }
    /**
     * An activity when a user payed their monthly membership
     */
    export interface MembershipActivity extends Activity
    {
        /**
         * The type of transaction
         */
        TransactionType: "Membership"
        /**
         * The name of the membership tier
         */
        MembershipTierName: string
    }
    /**
     * An activity when a user donated
     */
    export interface DonationActivity extends Activity
    {
        TransactionType: "Donation"
        Message: string
    }
    /**
     * The activities ko-fi sends to the client
     */
    export type Activities = ShopActivity | CommissionActivity | MembershipActivity | DonationActivity
    /**
     * The goal of the creator that has been set/updated
     */
    export interface Goal
    {
        /**
         * The name of the goal
         */
        Title: string
        /**
         * The amount of money the goal has already received
         */
        // TODO: is this string?
        GoalAmount: string | null
        /**
         * The currency the goal uses
         */
        Currency: string
        /**
         * Is the goal visible?
         */
        ShowGoal: boolean
        /**
         * The percentage of the goal from `0...100`
         */
        ProgressPercentage: number
    }
}

/**
 * An alert containing information about a goal
 */
export interface IGoalAlert extends IAlert<"goal">
{
    /**
     * The data from ko-fi
     */
    goal: KoFi.Goal
}

/**
 * An alert containing information about a activity
 */
export interface IActivityAlert extends IAlert<"activity">
{
    /**
     * The data from ko-fi
     */
    activity: KoFi.Activities
}

/** A union type of any kind of ko-fi alert */
export type KoFiAlert = IConfigAlert | IDonationAlert | IActivityAlert | IGoalAlert