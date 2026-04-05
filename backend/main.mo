import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // 1. TYPES AND CONSTANTS

  public type Area = Text;

  public type Profile = {
    name : Text;
    email : Text;
    area : Area;
    profileType : { #worker; #provider };
  };

  public type Job = {
    id : Nat;
    title : Text;
    category : Text;
    area : Area;
    description : Text;
    postedBy : Principal;
    status : { #open; #closed };
    salary : ?Nat;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type JobApplication = {
    id : Nat;
    jobId : Nat;
    applicant : Principal;
    coverLetter : Text;
    status : { #pending; #accepted; #rejected };
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type Matches = {
    jobId : Nat;
    workerId : Principal;
    score : Nat; // Simple scoring, higher is better, e.g., based on area match
  };

  public type SearchParams = {
    area : ?Area;
    title : ?Text;
    category : ?Text;
  };

  // 2. STATE

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let profiles = Map.empty<Principal, Profile>();
  let jobs = Map.empty<Nat, Job>();
  let applications = Map.empty<Nat, JobApplication>();

  var nextJobId = 0;
  var nextApplicationId = 0;

  // 3. PROFILE AREA MANAGEMENT

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getCallerProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(user);
  };

  public query ({ caller }) func getProfile(user : Principal) : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (profiles.get(caller)) {
      case (null) { profiles.add(caller, profile) };
      case (?_) { profiles.add(caller, profile) };
    };
  };

  public shared ({ caller }) func saveCallerProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (profiles.get(caller)) {
      case (null) { profiles.add(caller, profile) };
      case (?_) { profiles.add(caller, profile) };
    };
  };

  public query ({ caller }) func getAllProfiles() : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all profiles");
    };
    profiles.values().toArray();
  };

  // 4. JOB POSTING AREA

  public shared ({ caller }) func createJob(title : Text, category : Text, area : Area, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create jobs");
    };

    switch (profiles.get(caller)) {
      case (null) {
        Runtime.trap("Profile required: Create a provider profile before posting jobs");
      };
      case (?profile) {
        switch (profile.profileType) {
          case (#provider) {
            let newJob : Job = {
              id = nextJobId;
              title;
              category;
              area;
              description;
              postedBy = caller;
              status = #open;
              createdAt = Time.now();
              updatedAt = Time.now();
              salary = null;
            };

            jobs.add(nextJobId, newJob);
            nextJobId += 1;
            nextJobId - 1;
          };
          case (#worker) {
            Runtime.trap("Unauthorized: Only providers can create jobs");
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateJobArea(jobId : Nat, area : Area) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update jobs");
    };

    switch (jobs.get(jobId)) {
      case (null) {
        Runtime.trap("Job does not exist");
      };
      case (?job) {
        if (job.postedBy != caller) {
          Runtime.trap("Unauthorized: Only job creator can update job");
        };
        let updatedJob = {
          job with
          area;
          updatedAt = Time.now();
        };
        jobs.add(jobId, updatedJob);
      };
    };
  };

  public query ({ caller }) func getJobArea(jobId : Nat) : async ?Area {
    switch (jobs.get(jobId)) {
      case (null) { null };
      case (?job) { ?job.area };
    };
  };

  // 5. AREA VALIDATION AND SEARCH FUNCTIONALITY

  public query ({ caller }) func jobSearch(params : SearchParams) : async [Job] {
    jobs.values().toArray().filter(
      func(job) {
        switch (params.area, params.title, params.category) {
          case (?area, null, null) { Text.equal(job.area, area) };
          case (null, ?title, null) { job.title.contains(#text title) };
          case (null, null, ?category) { Text.equal(job.category, category) };
          case (?area, ?title, null) {
            Text.equal(job.area, area) and job.title.contains(#text title);
          };
          case (?area, null, ?category) {
            Text.equal(job.area, area) and Text.equal(job.category, category);
          };
          case (null, ?title, ?category) {
            job.title.contains(#text title) and Text.equal(job.category, category);
          };
          case (?area, ?title, ?category) {
            Text.equal(job.area, area) and job.title.contains(#text title) and Text.equal(
              job.category,
              category,
            );
          };
          case (null, null, null) { true };
        };
      }
    );
  };

  // 6. APPLICATION MANAGEMENT

  public shared ({ caller }) func applyToJob(jobId : Nat, coverLetter : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can apply to jobs");
    };

    switch (profiles.get(caller)) {
      case (null) {
        Runtime.trap("Profile required: Create a worker profile before applying to jobs");
      };
      case (?profile) {
        switch (profile.profileType) {
          case (#worker) {
            switch (jobs.get(jobId)) {
              case (null) {
                Runtime.trap("Job does not exist");
              };
              case (?job) {
                if (job.postedBy == caller) {
                  Runtime.trap("Cannot apply to your own job");
                };

                let newApplication : JobApplication = {
                  id = nextApplicationId;
                  jobId;
                  applicant = caller;
                  coverLetter;
                  status = #pending;
                  createdAt = Time.now();
                  updatedAt = Time.now();
                };

                applications.add(nextApplicationId, newApplication);
                nextApplicationId += 1;
                nextApplicationId - 1;
              };
            };
          };
          case (#provider) {
            Runtime.trap("Unauthorized: Only workers can apply to jobs");
          };
        };
      };
    };
  };

  public query ({ caller }) func getMyApplications() : async [JobApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view applications");
    };

    applications.values().filter(
      func(app) { app.applicant == caller }
    ).toArray();
  };

  public shared ({ caller }) func updateApplicationStatus(applicationId : Nat, status : { #pending; #accepted; #rejected }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update application status");
    };

    switch (applications.get(applicationId)) {
      case (null) {
        Runtime.trap("Application does not exist");
      };
      case (?app) {
        switch (jobs.get(app.jobId)) {
          case (null) {
            Runtime.trap("Invalid application: Job does not exist");
          };
          case (?job) {
            if (job.postedBy != caller) {
              Runtime.trap("Unauthorized: Only the job owner can update application status");
            };

            let updatedApp = {
              app with
              status;
              updatedAt = Time.now();
            };
            applications.add(applicationId, updatedApp);
          };
        };
      };
    };
  };
};
