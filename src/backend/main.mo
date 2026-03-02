import Map "mo:core/Map";
import Array "mo:core/Array";
import Float "mo:core/Float";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Application Types and Modules
  module DaySales {
    type DaySales = {
      id : Nat;
      date : Text;
      petrolPrice : Float;
      dieselPrice : Float;
      pump1_n1_open : Float;
      pump1_n1_close : Float;
      pump1_n2_open : Float;
      pump1_n2_close : Float;
      pump1_n3_open : Float;
      pump1_n3_close : Float;
      pump1_n4_open : Float;
      pump1_n4_close : Float;
      pump2_n1_open : Float;
      pump2_n1_close : Float;
      pump2_n2_open : Float;
      pump2_n2_close : Float;
      pump2_n3_open : Float;
      pump2_n3_close : Float;
      pump2_n4_open : Float;
      pump2_n4_close : Float;
      creditGiven : Float;
      testPetrol : Float;
      testDiesel : Float;
    };

    public func compareByDateDesc(a : DaySales, b : DaySales) : Order.Order {
      Text.compare(b.date, a.date);
    };
  };

  module CreditSettlement {
    type CreditSettlement = {
      id : Nat;
      date : Text;
      amountSettled : Float;
    };

    public func compareByDate(a : CreditSettlement, b : CreditSettlement) : Order.Order {
      Text.compare(a.date, b.date);
    };
  };

  type DaySales = {
    id : Nat;
    date : Text;
    petrolPrice : Float;
    dieselPrice : Float;
    pump1_n1_open : Float;
    pump1_n1_close : Float;
    pump1_n2_open : Float;
    pump1_n2_close : Float;
    pump1_n3_open : Float;
    pump1_n3_close : Float;
    pump1_n4_open : Float;
    pump1_n4_close : Float;
    pump2_n1_open : Float;
    pump2_n1_close : Float;
    pump2_n2_open : Float;
    pump2_n2_close : Float;
    pump2_n3_open : Float;
    pump2_n3_close : Float;
    pump2_n4_open : Float;
    pump2_n4_close : Float;
    creditGiven : Float;
    testPetrol : Float;
    testDiesel : Float;
  };

  type CreditSettlement = {
    id : Nat;
    date : Text;
    amountSettled : Float;
  };

  type BunkSetup = {
    bunkName : Text;
    location : Text;
  };

  let daySales = Map.empty<Text, Map.Map<Text, DaySales>>();
  let creditSettlements = Map.empty<Text, List.List<CreditSettlement>>();
  let setups = Map.empty<Text, BunkSetup>();

  public shared ({ caller }) func saveSetup(bunkName : Text, location : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save setup");
    };
    setups.add(caller.toText(), {
      bunkName;
      location;
    });
  };

  public query ({ caller }) func getSetup() : async ?BunkSetup {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access setup");
    };
    setups.get(caller.toText());
  };

  func getNextDaySalesId(caller : Principal) : Nat {
    switch (daySales.get(caller.toText())) {
      case (null) { 0 };
      case (?userDaySales) { userDaySales.size() };
    };
  };

  func getNextCreditSettlementId(caller : Principal) : Nat {
    switch (creditSettlements.get(caller.toText())) {
      case (null) { 0 };
      case (?userCreditSettlements) { userCreditSettlements.size() };
    };
  };

  public shared ({ caller }) func addDaySales(
    date : Text,
    petrolPrice : Float,
    dieselPrice : Float,
    pump1_n1_open : Float,
    pump1_n1_close : Float,
    pump1_n2_open : Float,
    pump1_n2_close : Float,
    pump1_n3_open : Float,
    pump1_n3_close : Float,
    pump1_n4_open : Float,
    pump1_n4_close : Float,
    pump2_n1_open : Float,
    pump2_n1_close : Float,
    pump2_n2_open : Float,
    pump2_n2_close : Float,
    pump2_n3_open : Float,
    pump2_n3_close : Float,
    pump2_n4_open : Float,
    pump2_n4_close : Float,
    creditGiven : Float,
    testPetrol : Float,
    testDiesel : Float,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add day sales");
    };

    let newDaySales : DaySales = {
      id = getNextDaySalesId(caller);
      date;
      petrolPrice;
      dieselPrice;
      pump1_n1_open;
      pump1_n1_close;
      pump1_n2_open;
      pump1_n2_close;
      pump1_n3_open;
      pump1_n3_close;
      pump1_n4_open;
      pump1_n4_close;
      pump2_n1_open;
      pump2_n1_close;
      pump2_n2_open;
      pump2_n2_close;
      pump2_n3_open;
      pump2_n3_close;
      pump2_n4_open;
      pump2_n4_close;
      creditGiven;
      testPetrol;
      testDiesel;
    };

    switch (daySales.get(caller.toText())) {
      case (?userDaySales) {
        switch (userDaySales.get(date)) {
          case (null) {
            userDaySales.add(date, newDaySales);
          };
          case (?_) {
            Runtime.trap("Day sales for this date already exists");
          };
        };
      };
      case (null) {
        let userDaySales = Map.empty<Text, DaySales>();
        userDaySales.add(date, newDaySales);
        daySales.add(caller.toText(), userDaySales);
      };
    };
  };

  public query ({ caller }) func getDaySalesByDate(date : Text) : async ?DaySales {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access day sales");
    };
    switch (daySales.get(caller.toText())) {
      case (null) { null };
      case (?userDaySales) { userDaySales.get(date) };
    };
  };

  public query ({ caller }) func getAllDaySales() : async [DaySales] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access day sales");
    };
    switch (daySales.get(caller.toText())) {
      case (null) { [] };
      case (?userDaySales) {
        let salesArray = userDaySales.values().toArray();
        salesArray.sort(DaySales.compareByDateDesc);
      };
    };
  };

  public shared ({ caller }) func updateDaySales(
    id : Nat,
    date : Text,
    petrolPrice : Float,
    dieselPrice : Float,
    pump1_n1_open : Float,
    pump1_n1_close : Float,
    pump1_n2_open : Float,
    pump1_n2_close : Float,
    pump1_n3_open : Float,
    pump1_n3_close : Float,
    pump1_n4_open : Float,
    pump1_n4_close : Float,
    pump2_n1_open : Float,
    pump2_n1_close : Float,
    pump2_n2_open : Float,
    pump2_n2_close : Float,
    pump2_n3_open : Float,
    pump2_n3_close : Float,
    pump2_n4_open : Float,
    pump2_n4_close : Float,
    creditGiven : Float,
    testPetrol : Float,
    testDiesel : Float,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update day sales");
    };

    switch (daySales.get(caller.toText())) {
      case (?userDaySales) {
        switch (userDaySales.get(date)) {
          case (?_) {
            let updatedDaySales : DaySales = {
              id;
              date;
              petrolPrice;
              dieselPrice;
              pump1_n1_open;
              pump1_n1_close;
              pump1_n2_open;
              pump1_n2_close;
              pump1_n3_open;
              pump1_n3_close;
              pump1_n4_open;
              pump1_n4_close;
              pump2_n1_open;
              pump2_n1_close;
              pump2_n2_open;
              pump2_n2_close;
              pump2_n3_open;
              pump2_n3_close;
              pump2_n4_open;
              pump2_n4_close;
              creditGiven;
              testPetrol;
              testDiesel;
            };
            userDaySales.add(date, updatedDaySales);
          };
          case (null) {
            Runtime.trap("Day sales not found for this date");
          };
        };
      };
      case (null) {
        Runtime.trap("Day sales not found for this date");
      };
    };
  };

  public shared ({ caller }) func deleteDaySalesByDate(date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete day sales");
    };

    switch (daySales.get(caller.toText())) {
      case (?userDaySales) {
        switch (userDaySales.get(date)) {
          case (?_) {
            userDaySales.remove(date);
          };
          case (null) {
            Runtime.trap("Day sales not found for this date");
          };
        };
      };
      case (null) {
        Runtime.trap("Day sales not found for this date");
      };
    };
  };

  func createCreditSettlement(caller : Principal, date : Text, amountSettled : Float) : CreditSettlement {
    {
      id = getNextCreditSettlementId(caller);
      date;
      amountSettled;
    };
  };

  public shared ({ caller }) func addCreditSettlement(date : Text, amountSettled : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add credit settlements");
    };

    if (amountSettled <= 0.0) {
      Runtime.trap("Amount settled must be greater than 0");
    };

    let newSettlement = createCreditSettlement(caller, date, amountSettled);

    switch (creditSettlements.get(caller.toText())) {
      case (null) {
        let newList = List.empty<CreditSettlement>();
        newList.add(newSettlement);
        creditSettlements.add(caller.toText(), newList);
      };
      case (?userCreditSettlements) {
        userCreditSettlements.add(newSettlement);
      };
    };
  };

  public query ({ caller }) func getCreditSettlements(from : Text, to : Text) : async [CreditSettlement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access credit settlements");
    };
    filterCreditSettlementsByDateRange(caller, from, to);
  };

  public query ({ caller }) func getTotalOutstandingCredit() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access outstanding credit");
    };
    let totalCreditGiven = calculateTotalCreditGiven(caller);
    let totalCreditSettled = calculateTotalCreditSettled(caller);
    let outstandingCredit = totalCreditGiven - totalCreditSettled;
    Float.max(0.0, outstandingCredit);
  };

  func filterCreditSettlementsByDateRange(caller : Principal, from : Text, to : Text) : [CreditSettlement] {
    switch (creditSettlements.get(caller.toText())) {
      case (null) { [] };
      case (?userCreditSettlements) {
        let filtered = userCreditSettlements.toArray().filter(
          func(settlement) {
            settlement.date >= from and settlement.date <= to
          }
        );
        filtered.sort(CreditSettlement.compareByDate);
      };
    };
  };

  func calculateTotalCreditGiven(caller : Principal) : Float {
    switch (daySales.get(caller.toText())) {
      case (null) { 0.0 };
      case (?userDaySales) {
        let allDaySales = userDaySales.values().toArray();
        var totalCreditGiven = 0.0;
        for (daySale in allDaySales.values()) {
          totalCreditGiven += daySale.creditGiven;
        };
        totalCreditGiven;
      };
    };
  };

  func calculateTotalCreditSettled(caller : Principal) : Float {
    switch (creditSettlements.get(caller.toText())) {
      case (null) { 0.0 };
      case (?userCreditSettlements) {
        let allCreditSettlements = userCreditSettlements.toArray();
        var totalCreditSettled = 0.0;
        for (creditSettlement in allCreditSettlements.values()) {
          totalCreditSettled += creditSettlement.amountSettled;
        };
        totalCreditSettled;
      };
    };
  };
};
