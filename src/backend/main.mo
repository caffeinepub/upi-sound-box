import Time "mo:core/Time";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Map "mo:core/Map";

actor {
  type Transaction = {
    id : Nat;
    amount : Nat;
    upiId : Text;
    senderName : Text;
    timestamp : Time.Time;
    status : Text;
  };

  module Transaction {
    public func compareByTimestamp(t1 : Transaction, t2 : Transaction) : Order.Order {
      Int.compare(t2.timestamp : Int, t1.timestamp : Int); // Descending order
    };
  };

  let transactions = Map.empty<Nat, Transaction>();
  var nextId = 1;

  // Add new transaction
  public shared ({ caller }) func addTransaction(amount : Nat, upiId : Text, senderName : Text, status : Text) : async Nat {
    let transaction : Transaction = {
      id = nextId;
      amount;
      upiId;
      senderName;
      timestamp = Time.now();
      status;
    };
    transactions.add(nextId, transaction);
    nextId += 1;
    transaction.id;
  };

  // Get all transactions sorted by newest first
  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    transactions.values().toArray().sort(Transaction.compareByTimestamp);
  };

  // Get today's summary
  public query ({ caller }) func getTodaysSummary() : async {
    totalAmount : Nat;
    transactionCount : Nat;
  } {
    let now = Time.now();
    let oneDayNanos : Time.Time = 24 * 60 * 60 * 1_000_000_000;
    let allTransactions = transactions.values().toArray();
    let todaysTransactions = allTransactions.filter(
      func(t) { now - t.timestamp <= oneDayNanos }
    );
    let totalAmount = todaysTransactions.foldLeft(
      0,
      func(acc, t) { acc + t.amount },
    );
    let transactionCount = todaysTransactions.size();
    {
      totalAmount;
      transactionCount;
    };
  };

  // Seed with sample transactions
  public shared ({ caller }) func seedDemoTransactions() : async () {
    transactions.clear();
    nextId := 1;
    let _ = await addTransaction(500, "user1@upi", "Alice", "COMPLETED");
    let _ = await addTransaction(750, "user2@upi", "Bob", "PENDING");
    let _ = await addTransaction(1200, "user3@upi", "Charlie", "COMPLETED");
  };
};
